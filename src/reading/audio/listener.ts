export type ListenState = 'connecting' | 'listening' | 'processing' | 'done' | 'unavailable';
const MAX_RECORDING_BYTES = 16_000 * 2 * 95;

/**
 * Follows reading live over the WebSocket gateway. Hosts without inbound WebSockets (Vercel)
 * reject the upgrade, so the recording is kept locally and transcribed once at "I'm done".
 */
export function listenToReading(
  onText: (text: string, final: boolean) => void,
  onState: (state: ListenState) => void,
) {
  let canceled = false,
    finishing = false,
    live = false,
    recorded = 0;
  let stream: MediaStream | undefined,
    context: AudioContext | undefined,
    node: AudioWorkletNode | undefined,
    source: MediaStreamAudioSourceNode | undefined,
    socket: WebSocket | undefined;
  const complete = new Map<string, string>();
  const recording: ArrayBuffer[] = [];
  const request = new AbortController();
  let timeout: ReturnType<typeof setTimeout>;
  const stop = () => {
    canceled = true;
    clearTimeout(timeout);
    request.abort();
    stream?.getTracks().forEach((track) => track.stop());
    source?.disconnect();
    node?.disconnect();
    void context?.close().catch(() => {});
    if (socket && socket.readyState < WebSocket.CLOSING) socket.close();
  };
  const fail = () => {
    if (!canceled) {
      onState('unavailable');
      stop();
    }
  };
  const capture = () => {
    if (source || canceled) return;
    clearTimeout(timeout);
    timeout = setTimeout(fail, 95_000);
    source = context!.createMediaStreamSource(stream!);
    source.connect(node!);
    onState('listening');
  };
  const transcribe = async () => {
    try {
      const body = new Uint8Array(recorded);
      let offset = 0;
      for (const chunk of recording) {
        body.set(new Uint8Array(chunk), offset);
        offset += chunk.byteLength;
      }
      if (!offset) {
        onState('done');
        stop();
        return;
      }
      const response = await fetch('/api/reading/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body,
        signal: request.signal,
      });
      const result = await response.json();
      if (canceled) return;
      if (!response.ok || typeof result.text !== 'string') throw new Error('Unavailable');
      onText(result.text, true);
      onState('done');
      stop();
    } catch {
      fail();
    }
  };
  onState('connecting');
  timeout = setTimeout(fail, 12_000);
  void (async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
        video: false,
      });
      if (canceled) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      context = new AudioContext();
      await context.resume();
      await context.audioWorklet.addModule('/reading/capture.js');
      if (canceled) return;
      node = new AudioWorkletNode(context, 'reading-capture');
      const silent = context.createGain();
      silent.gain.value = 0;
      node.connect(silent).connect(context.destination);
      socket = new WebSocket(
        `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/api/reading/listen`,
      );
      socket.onmessage = (e) => {
        if (canceled) return;
        try {
          const message = JSON.parse(e.data);
          if (message.type === 'ready') {
            live = true;
            capture();
          } else if (message.type === 'partial' || message.type === 'complete') {
            if (message.type === 'complete') complete.set(message.itemId, message.text);
            onText(
              [...complete.values(), ...(message.type === 'partial' ? [message.text] : [])].join(
                ' ',
              ),
              finishing && message.type === 'complete',
            );
            if (finishing && message.type === 'complete') {
              onState('done');
              stop();
            }
          } else if (message.type === 'empty') {
            onState('done');
            stop();
          } else fail();
        } catch {
          fail();
        }
      };
      node.port.onmessage = (e) => {
        if (canceled) return;
        if (live) {
          if (socket?.readyState !== WebSocket.OPEN) return;
          if (e.data === 'flushed') socket.send('finish');
          else if (socket.bufferedAmount < 128 * 1024) socket.send(e.data);
          else fail();
        } else if (e.data === 'flushed') void transcribe();
        else if ((recorded += e.data.byteLength) <= MAX_RECORDING_BYTES) recording.push(e.data);
        else fail();
      };
      // A live session that drops fails; a rejected upgrade switches to recording.
      socket.onerror = socket.onclose = () => {
        if (canceled) return;
        if (live) fail();
        else capture();
      };
    } catch {
      fail();
    }
  })();
  return {
    stop,
    finish: () => {
      if (canceled || finishing) return;
      finishing = true;
      source?.disconnect();
      stream?.getTracks().forEach((track) => track.stop());
      node?.port.postMessage('flush');
      onState('processing');
      clearTimeout(timeout);
      timeout = setTimeout(fail, live ? 8000 : 45_000);
    },
  };
}

export type ListenState = 'connecting' | 'listening' | 'processing' | 'done' | 'unavailable';
export function listenToReading(
  onText: (text: string, final: boolean) => void,
  onState: (state: ListenState) => void,
) {
  let canceled = false,
    finishing = false;
  let stream: MediaStream | undefined,
    context: AudioContext | undefined,
    node: AudioWorkletNode | undefined,
    source: MediaStreamAudioSourceNode | undefined,
    socket: WebSocket | undefined;
  const complete = new Map<string, string>();
  let timeout: ReturnType<typeof setTimeout>;
  const stop = () => {
    canceled = true;
    clearTimeout(timeout);
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
            clearTimeout(timeout);
            timeout = setTimeout(fail, 95_000);
            source = context!.createMediaStreamSource(stream!);
            source.connect(node!);
            onState('listening');
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
        if (canceled || socket?.readyState !== WebSocket.OPEN) return;
        if (e.data === 'flushed') socket.send('finish');
        else if (socket.bufferedAmount < 128 * 1024) socket.send(e.data);
        else fail();
      };
      socket.onerror = fail;
      socket.onclose = () => {
        if (!canceled) fail();
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
      timeout = setTimeout(fail, 8000);
    },
  };
}

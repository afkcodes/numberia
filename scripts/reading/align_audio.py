"""Prepare word timings from actual narration with wav2vec2 CTC alignment.

Run: uv run --with onnxruntime --with numpy scripts/reading/align_audio.py MODEL_DIR
MODEL_DIR contains Xenova/wav2vec2-base-960h model_quantized.onnx as model.onnx
and vocab.json. This is offline authoring tooling, never a browser dependency.
"""
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys

import numpy as np
import onnxruntime as ort

root = Path(__file__).resolve().parents[2] / 'public' / 'reading' / 'audio'
model_root = Path(sys.argv[1])
vocab = json.loads((model_root / 'vocab.json').read_text())
options = ort.SessionOptions()
options.intra_op_num_threads = 4
model = ort.InferenceSession(str(model_root / 'model.onnx'), options, providers=['CPUExecutionProvider'])
blank = vocab['<pad>']
manifest = {}
for clip in json.loads((root / 'sources.json').read_text()):
    path = root / (clip['id'] + '.wav')
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(path), '-ar', '16000', '-ac', '1', '-f', 'f32le', 'pipe:1'], capture_output=True, check=True).stdout
    audio = np.frombuffer(raw, dtype='<f4')
    values = (audio - audio.mean()) / np.sqrt(audio.var() + 1e-7)
    logits = model.run(None, {'input_values': values[None, :].astype(np.float32)})[0][0]
    logits -= np.max(logits, axis=-1, keepdims=True)
    scores = logits - np.log(np.exp(logits).sum(axis=-1, keepdims=True))
    words = clip['text'].split()
    labels = []
    word_states = []
    for word in words:
        normalized = re.sub("[^A-Z']", '', word.upper().replace('’', "'"))
        if not normalized:
            raise ValueError('Every displayed token must have a spoken mapping: ' + word)
        states = []
        for letter in normalized:
            states.append(2 * len(labels) + 1)
            labels.append(vocab[letter])
        word_states.append(states)
        labels.append(vocab['|'])
    labels.pop()
    target = np.full(len(labels) * 2 + 1, blank, dtype=int)
    target[1::2] = labels
    previous = np.full(len(target), -np.inf)
    previous[0] = 0
    trace = np.zeros((len(scores), len(target)), dtype=np.uint8)
    skip = (target != blank) & (target != np.roll(target, 2))
    skip[:2] = False
    for frame, emission in enumerate(scores):
        stay = previous
        step = np.concatenate(([-np.inf], previous[:-1]))
        jump = np.concatenate(([-np.inf, -np.inf], previous[:-2]))
        jump[~skip] = -np.inf
        candidates = np.stack((stay, step, jump))
        trace[frame] = np.argmax(candidates, axis=0)
        previous = np.max(candidates, axis=0) + emission[target]
    state = len(target) - (1 if previous[-1] >= previous[-2] else 2)
    if not np.isfinite(previous[state]):
        raise ValueError('Narration cannot be aligned: ' + clip['id'])
    path_states = np.zeros(len(scores), dtype=int)
    for frame in range(len(scores) - 1, -1, -1):
        path_states[frame] = state
        state -= int(trace[frame, state])
    timings = []
    for index, states in enumerate(word_states):
        frames = np.flatnonzero(np.isin(path_states, states))
        if not len(frames):
            raise ValueError('Missing word: ' + words[index])
        timings.append({'word': words[index], 'start': round(max(0, frames[0] * 0.02), 3), 'end': round(min(len(audio) / 16000, (frames[-1] + 1) * 0.02), 3)})
    decoded = []
    last = None
    inverse = {v: k for k, v in vocab.items()}
    for label in np.argmax(scores, axis=1):
        if label != blank and label != last:
            decoded.append(inverse[label])
        last = label
    manifest[clip['id']] = {'text': clip['text'], 'textHash': clip['hash'], 'audioHash': hashlib.sha256(path.read_bytes()).hexdigest(), 'url': '/reading/audio/' + path.name, 'duration': round(len(audio) / 16000, 3), 'words': timings}
    print(clip['id'] + ': ' + ''.join(decoded).replace('|', ' '), flush=True)
(root / 'timings.json').write_text(json.dumps(manifest, indent=2) + '\n')

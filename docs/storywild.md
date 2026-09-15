# Storywild: a story the child directs

## What ships

One complete adventure, **The hat that wouldn’t stay put**, with three reading sizes and three playable endings. It shares Numberia’s navigation, grade profile, local save, XP/gem balance, and backpack. No account or browser model download is needed.

1. Build **hat**, **drifting**, or **unpredictable**, depending on the reading size.
2. Read four connected pages. Listen, tap a word for meaning, optionally read to Lumi, or read silently.
3. Press **Make it happen** to animate the sentence, then turn the page.
4. Choose the ribbon that solves Pip’s problem. Other choices explain why they do not hold the hat in place and invite another try.
5. Replace a verb with **hops**, **spins**, or **tiptoes** and act out the resulting sentence.
6. Keep the ending and hat keepsake. First completion of each edition earns 100 XP and 15 gems; rereading updates the ending without duplicate rewards.

The grade sets an initial edition: K–1 short lines, grades 2–3 growing stories, and grades 4–5 longer passages. Children can choose another size. The longest edition is still a short prototype story, not representative grade 4–5 coverage. Educator review and a larger, deliberately sequenced library remain necessary before presenting it as a complete curriculum.

## Reading rationale

The story passport keeps each distinct ending a child completes, including rereads at the same reading size. Lumi wears a bow, then an explorer hat, then a storyteller crown as the three endings are collected. Returning readers get an invitation to try a missing ending, or a character-voice reread after collecting all three. Stamps never expire and rereading never requires a harder level.

Finishing the story also makes Pip available as a shared adventure companion. Collecting all three endings unlocks Lumi. Existing math chapter unlocks continue to work.

Word construction connects letter patterns and meaningful word parts to a word used in connected text. Narration models fluent reading; rereading supports practice. The ribbon choice asks for a text-based explanation, and verb substitution connects reading with sentence meaning.

These choices draw on IES guidance for [foundational reading skills in K–3](https://ies.ed.gov/ncee/wwc/PracticeGuide/21), [K–3 comprehension](https://ies.ed.gov/ncee/wwc/PracticeGuide/14), and [reading intervention in grades 4–9](https://ies.ed.gov/ncee/wwc/PracticeGuide/29). They are design references, not evidence that this prototype improves learning. The app does not infer mastery, diagnose difficulties, or score oral accuracy from recognition.

## Prepared narration and word timings

The 12 page recordings and 3 endings in `public/reading/audio/` contain original story text generated with Nari’s `qwen3-tts-fast:free`, English, and Phoebe. WAV headers specify 24 kHz mono PCM16. Together they occupy about 3.7 MB; a page preloads only its clip. Word-building guidance still uses the existing live narration/device fallback.

`timings.json` maps each displayed word to its onset and end in its recording. The development-only tool runs a quantized **wav2vec2-base-960h** ONNX model and CTC forced alignment against the authored text. Only the resulting timestamps ship to the browser. These are model-derived timings, not timestamps supplied by Nari, and should be reviewed when changing a clip.

The player follows `HTMLAudioElement.currentTime`, holding the current word until the next onset so natural pauses do not flash the highlight off. Slow playback and word seeking use the same audio clock. Asset tests validate transcript, text/audio hashes, WAV format, duration, and ordered word timings. They catch stale or mismatched assets but do not establish pronunciation quality.

To change audio:

The authoring script records its spoken input separately from displayed text. It uses `tip-toes` as a pronunciation hint so the voice preserves both syllables of `tiptoes`. The aligned reader still displays the original word. Pass `--force=CLIP_ID` to regenerate an unchanged clip when reviewing a voice take.

```sh
# Uses NARI_API_KEY in .env; skips unchanged existing clips.
node --experimental-strip-types scripts/reading/generate-audio.ts

# Run after downloading model.onnx and vocab.json outside the repository.
uv run --with onnxruntime --with numpy scripts/reading/align_audio.py /path/to/model-directory
```

The model directory needs `model.onnx` (the quantized ONNX file) and `vocab.json` from [Xenova/wav2vec2-base-960h](https://huggingface.co/Xenova/wav2vec2-base-960h/tree/main). The script requires `ffmpeg`. Do not ship model weights, `.env`, or the Python environment. Review regenerated audio and timings, then run `npm run check`.

## Optional live following

The child chooses **Read to Lumi**, sees an explanation, and presses **Start listening** before the browser microphone prompt. An AudioWorklet converts input to mono 16 kHz PCM16 in 100 ms blocks. Binary audio travels to `/api/reading/listen`, which connects to Nari’s realtime transcription endpoint with the private server key. Model and language are fixed on the server; only readiness, short transcripts, completion, and generic unavailability return to the browser.

The client replaces revised partial hypotheses rather than appending them. Sequence alignment follows normalized words while allowing repeats and omissions. Matched words receive an underline; the latest matching word receives a tint. This is transcript following, not acoustic alignment or pronunciation assessment. ASR may miss or normalize a child’s words. Recognition never unlocks or withholds an action: **Make it happen** remains available without a microphone.

**I’m done**, cancellation, and leaving the page stop microphone tracks, the audio graph, and both WebSockets. Permission denial, absent configuration, network errors, and exhausted allowances leave silent reading available. The app does not persist audio or transcripts. Nari receives microphone audio when the child opts in; provider retention is governed by its terms, not the app’s local-save behavior.

The gateway permits two concurrent microphone sessions, ten connection attempts per client per minute, 8 KiB incoming frames, at most 100 seconds of PCM, and a two-minute connection lifetime. It rejects missing/foreign origins and missing keys. The client caps capture at 95 seconds, setup at 12 seconds, and finalization at 8 seconds. The provider’s free allowance is not unlimited classroom capacity. See [Nari realtime transcription](https://docs.narilabs.com/transcribe-audio) and [rate limits](https://docs.narilabs.com/rate-limits).

Sherpa ONNX is not included in this version. The existing Nari key supports the optional live feature; prepared narration avoids putting a model download or synthesis wait in the main reading path.

## Code boundaries

| Location                                    | Responsibility                                     |
| ------------------------------------------- | -------------------------------------------------- |
| `src/features/reading/ReadingAdventure.tsx` | Story phases, page actions, remix, reward dispatch |
| `src/features/reading/StoryStage.tsx`       | SVG paper scenery and articulated Pip              |
| `src/features/reading/StoryReader.tsx`      | Read/listen controls, word help, microphone opt-in |
| `src/features/reading/WordBuilder.tsx`      | Supported letter and word-part construction        |
| `src/reading/content.ts`                    | Authored editions, word meanings, ending choices   |
| `src/reading/progress.ts`                   | Migration, bookmarks, idempotent rewards           |
| `src/reading/matching.ts`                   | Revised transcript matching                        |
| `src/reading/audio/`                        | Prepared playback and capture lifecycle            |
| `server/reading.ts`                         | Private realtime transcription gateway             |
| `scripts/reading/`                          | Development-only audio authoring tools             |

## Checks

Tests cover save migration, malformed data, bookmark validation, supported and duplicate rewards, transcript revisions, repeats/omissions, audio/timing consistency, WebSocket origin/key validation, fixed provider settings, PCM forwarding, malformed input, and connection closure. Browser checks cover the complete story, word seeking/pause, microphone denial, live capture with a synthetic test recording, all three ending actions, saved keepsakes, longer passages, and widths 320–1440. Reduced motion preserves completed scene states. Narrow screens use normal page scrolling with no nested reading scroller.

# Spoken counting and guidance

Milo’s questions, hints, and explanations use Nari’s `qwen3-tts-fast:free` endpoint with the `phoebe` voice when `NARI_API_KEY` is configured on the server. Audio starts playing from the streamed response rather than waiting for the complete file. No speech model is downloaded to the child’s browser.

Quick counts such as “1”, “2”, “3 pieces”, and “4 in this basket” keep the original browser `speechSynthesis` voice. This preserves immediate counting without a network request for every object. The device voice prefers natural or enhanced English voices, at rate `0.96` and normal pitch. Actual installed voices vary by device.

## Run locally

Keep the key in the root `.env` file:

```dotenv
NARI_API_KEY=your_key_here
NARI_VOICE=phoebe
```

Use `.env.example` as a template. `.env` is ignored by Git. Never name this key `VITE_NARI_API_KEY`: `VITE_` variables are browser-visible. The existing `npm run dev` and `npm run preview` commands register a server-only `/api/speech` route. Restart the command after changing server environment settings.

For the built application:

```sh
npm run build
npm start
```

The Node server serves `dist/` and the speech route on `http://127.0.0.1:3000`. `PORT` and `NUMBERIA_HOST` can override its listener. Deployment needs this server or an equivalent same-origin endpoint with the secret configured at runtime. Static-only hosting keeps the device voice fallback; the key is never embedded in a build.

## Playback and cancellation

Nari returns 24 kHz, mono, signed 16-bit little-endian PCM. The player handles sample bytes split across network reads, collects 200 ms of audio initially, and schedules complete 100 ms blocks with Web Audio at the correct sample rate. A short final block plays when the response finishes. Network fragments do not create separate tiny audio sources, which helps avoid clicks and gaps during a busy 3D scene. The player resolves a spoken line only after queued audio has finished playing, so demonstrations still finish each count before moving on.

One narration request combines neighboring sentences and spells out numbers, decimal digits, operators, and fractions as spoken English. For example, the question button sends “Six plus four. What is the answer?” for `6 + 4`. The provider receives `language: "en"`. Count-only phrases remain separate and keep their original device narration. Game sound effects fade out during speech, and new effects are suppressed until narration finishes so beeps do not obscure instructions.

Mute, reset, a new hint, and leaving an activity abort the active download and stop scheduled audio. Canceling a download also cancels upstream generation when it is still active.

If no audio arrives within 1.8 seconds, or the API is unavailable, the app uses the original device voice and avoids new API attempts for one minute. A stream that fails after playback starts is stopped without replaying the whole line; the existing listen button can repeat the instruction. A five-second stream stall and a sixty-second total playback limit keep narration from blocking the queue. Visible math and controls continue to work without speech.

## Requests, caching, and limits

The server accepts only same-origin JSON text requests, caps text at 600 characters, permits at most two concurrent generations and twenty uncached requests per client per minute, and never returns the provider key or provider error bodies. Model and voice are chosen by the server. Completed lines are cached in process memory, up to 64 entries / 8 MiB; incomplete or canceled streams are not cached. Cache hits reuse audio without another provider request. The cache resets when the server restarts.

As checked on September 13, 2026, Nari documents **100 accepted requests per day** for `qwen3-tts-fast:free`, with a default shared concurrency limit of two. Accepted cancellations also consume the allowance. Free service has no latency guarantee. Counting locally, combining sentences, and reusing cached lines reduce API usage; this free allowance is suitable for trying the integration, not unlimited classroom narration.

Official references: [streaming format and playback](https://docs.narilabs.com/streaming-audio), [speech requests](https://docs.narilabs.com/generate-speech), [voice IDs](https://docs.narilabs.com/voices), and [free limits](https://docs.narilabs.com/rate-limits).

## Validation

Automated tests cover PCM boundaries and scheduling, playback before EOF, speech completion, aborts during activation and playback, immediate counting, fallback and cooldown, request validation, private headers, complete-response caching, and upstream cancellation. Existing speech queue tests cover ordering and arithmetic formatting. Live browser checks exercise the actual Phoebe endpoint and muted playback; they verify the transport and player, not perceived voice quality on every device.

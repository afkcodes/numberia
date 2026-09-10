# Spoken counting and guidance

Counting, questions, answer explanations, and Milo’s hints use the original browser `speechSynthesis` voice. The app prefers natural or enhanced English voices, with a conversational rate of `0.96` and normal pitch (`1`). Actual voice availability and sound depend on the browser and installed voices.

There is no recorded counting pack, in-browser speech model, voice download, or voice-loading overlay. Synthesized game sound effects still use Web Audio.

Numbers are spoken in order. During demonstrations, the highlighted item stays active until its spoken count finishes, followed by the answer explanation. Manual berry taps queue each number. A new hint replaces older narration; mute, reset, and leaving an activity stop active and queued speech.

The shared speech formatter expands arithmetic operators and spoken fractions while preserving decimal values. If speech is unavailable, visible instructions, counting, and game controls continue to work.

The speech queue tests cover ordering, cancellation, replacement hints, errors, and math formatting. Browser checks inspect the speech API calls and cancellation with a mocked device voice; they do not measure audible voice quality on the learner’s device.

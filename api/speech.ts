import type { IncomingMessage, ServerResponse } from 'node:http';
// Vercel compiles each function to JavaScript, so the sibling import uses the emitted extension.
import { createSpeechHandler } from '../server/speech.js';

/** Vercel entry for the same-origin speech gateway. Cache and limits are per function instance. */
const speech = createSpeechHandler({
  apiKey: process.env.NARI_API_KEY,
  voice: process.env.NARI_VOICE,
});

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return speech(req, res);
}

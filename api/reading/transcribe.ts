import type { IncomingMessage, ServerResponse } from 'node:http';
// Vercel compiles each function to JavaScript, so the sibling import uses the emitted extension.
import { createTranscribeHandler } from '../../server/reading.js';

/** Vercel cannot accept browser WebSockets, so the reading microphone uses this batch route. */
const transcribe = createTranscribeHandler({ apiKey: process.env.NARI_API_KEY });

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return transcribe(req, res);
}

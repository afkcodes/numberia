import type { Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createSpeechHandler } from './speech.ts';
import { attachReadingRecognition, createTranscribeHandler } from './reading.ts';

export function speechPlugin(apiKey?: string, voice?: string): Plugin {
  const handler = createSpeechHandler({ apiKey, voice });
  const transcribe = createTranscribeHandler({ apiKey });
  const middleware = (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const pathname = req.url?.split('?')[0];
    if (pathname === '/api/speech') void handler(req, res);
    else if (pathname === '/api/reading/transcribe') void transcribe(req, res);
    else next();
  };
  return {
    name: 'numberia-private-speech',
    configureServer(server) {
      server.middlewares.use(middleware);
      if (server.httpServer) attachReadingRecognition(server.httpServer, { apiKey });
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
      attachReadingRecognition(server.httpServer, { apiKey });
    },
  };
}

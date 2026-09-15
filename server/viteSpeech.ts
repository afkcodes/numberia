import type { Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createSpeechHandler } from './speech.ts';
import { attachReadingRecognition } from './reading.ts';

export function speechPlugin(apiKey?: string, voice?: string): Plugin {
  const handler = createSpeechHandler({ apiKey, voice });
  const middleware = (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (req.url?.split('?')[0] !== '/api/speech') {
      next();
      return;
    }
    void handler(req, res);
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

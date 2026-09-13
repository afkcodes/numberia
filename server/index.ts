import { fileURLToPath } from 'node:url';
import { createAppServer } from './app.ts';

const port = Number(process.env.PORT ?? 3000);
const host = process.env.NUMBERIA_HOST ?? '127.0.0.1';
const server = createAppServer({
  root: fileURLToPath(new URL('../dist', import.meta.url)),
  apiKey: process.env.NARI_API_KEY,
  voice: process.env.NARI_VOICE,
});
server.listen(port, host, () => console.log(`Numberia is ready at http://${host}:${port}`));

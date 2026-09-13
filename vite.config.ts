import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { speechPlugin } from './server/viteSpeech';
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'NARI_');
  return {
    plugins: [react(), speechPlugin(env.NARI_API_KEY, env.NARI_VOICE)],
    build: { rollupOptions: { output: { manualChunks: { three: ['three'] } } } },
  };
});

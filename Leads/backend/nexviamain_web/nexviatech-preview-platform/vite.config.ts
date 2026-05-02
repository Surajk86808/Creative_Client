import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'serve-sites-json',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === '/data/sites.json') {
              const sitesPath = path.resolve(__dirname, '../../data/sites.json');
              if (fs.existsSync(sitesPath)) {
                res.setHeader('Content-Type', 'application/json');
                res.end(fs.readFileSync(sitesPath));
                return;
              }
            }
            next();
          });
        },
      },
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});

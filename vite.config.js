import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import r2UploadUrlHandler from './api/r2-upload-url.js'
import r2DeleteHandler from './api/r2-delete.js'
import r2ListHandler from './api/r2-list.js'

function r2DevApi(env) {
  return {
    name: 'designlab-r2-dev-api',
    configureServer(server) {
      const useJsonApi = (path, handler) => server.middlewares.use(path, async (req, res, next) => {
        if (req.method !== 'POST') return next();
        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', async () => {
          const response = {
            setHeader(name, value) { res.setHeader(name, value); },
            status(code) { res.statusCode = code; return this; },
            json(data) { res.end(JSON.stringify(data)); }
          };
          try {
            await handler({ method: req.method, body: JSON.parse(body || '{}') }, response);
          } catch (error) {
            console.error('[R2 dev API]', error);
            if (!res.writableEnded) { res.statusCode = 500; res.end(JSON.stringify({ error: '本機 API 執行失敗' })); }
          }
        });
      });
      useJsonApi('/api/r2-upload-url', r2UploadUrlHandler);
      useJsonApi('/api/r2-delete', r2DeleteHandler);
      useJsonApi('/api/r2-list', r2ListHandler);
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  for (const key of ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME', 'R2_PUBLIC_URL']) {
    if (env[key]) process.env[key] = env[key];
  }
  return {
  base: './',
  plugins: [
    vue(),
    r2DevApi(env)
  ],
  server: {
    host: true,
  },
  };
})

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = env.VITE_BASE_PATH || '/ilnara/';
  const siteUrl = (env.VITE_SITE_URL || 'https://reasqq.github.io/ilnara/').replace(/\/?$/, '/');
  return {
    base,
    plugins: [react(), {
      name: 'absolute-social-metadata',
      transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', siteUrl),
    }],
    build: { rolldownOptions: { output: { manualChunks(id: string) {
      if (id.includes('/three/')) return 'three';
      if (id.includes('/gsap/')) return 'motion';
    } } } },
  };
});

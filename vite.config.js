import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      workbox: {
        globPatterns: ['**/*'],
      },
      includeAssets: ['**/*'],
      manifest: {
        name: 'BlahajsSpinningBlahajs',
        display: 'fullscreen',
        start_url: '/',
      },
    }),
  ],
});

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
        short_name: 'Blahaj',
        description: 'Spinning shork :3',
        theme_color: '#ffffff',
        background_color: '#577183',
        display: 'fullscreen',
        start_url: '/',
        icons: [
            {
                src: 'pwa192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: 'pwa512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    },
    }),
  ],
});


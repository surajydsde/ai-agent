import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/favicon.ico', 'icons/icon-192x192.png', 'icons/icon-512x512.png'],
      manifest: {
        name: 'Nexora AI',
        short_name: 'Nexora AI',
        description: 'Private, local AI chat with Llama and DeepSeek.',
        theme_color: '#007AFF',
        background_color: '#212121',
        display: 'standalone',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    globals: true,
  },
});

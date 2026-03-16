import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: {
      'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL || 'https://rading-production-b5b3.up.railway.app')
    },
    plugins: [
      react(), 
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'icons.svg'],
        manifest: {
          name: 'CryptoX Exchange',
          short_name: 'CryptoX',
          description: 'Professional Cryptocurrency Trading Platform',
          theme_color: '#0b0e11',
          background_color: '#0b0e11',
          display: 'standalone',
          icons: [
            {
              src: '/favicon.svg',
              sizes: '192x192',
              type: 'image/svg+xml'
            },
            {
              src: '/icons.svg',
              sizes: '512x512',
              type: 'image/svg+xml'
            }
          ]
        }
      })
    ],
  };
});

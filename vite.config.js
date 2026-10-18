import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Posyandu 6 SPM Desa Nanjung',
        short_name: 'Posyandu 6 SPM',
        description: 'Aplikasi Pencatatan dan Pelaporan Posyandu Desa Nanjung',
        theme_color: '#1A5D1A', // Warna hijau utama aplikasi Anda
        background_color: '#F6F7F2',
        display: 'standalone', // Membuatnya tampil seperti aplikasi native (tanpa address bar)
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    host: true
  }
});
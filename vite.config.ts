import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      base: '/ringcraftlab-tool/',
      includeAssets: ['favicon.svg', 'hero-system-planner.png'],
      manifest: {
        name: 'RingCraftLab Refill Maker',
        short_name: 'Refill Maker',
        description: 'スマホの写真をシステム手帳のリフィルに変換してPDF出力するツール',
        theme_color: '#ffd24a',
        background_color: '#ffd24a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/ringcraftlab-tool/',
        start_url: '/ringcraftlab-tool/',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: null,
      },
    }),
  ],
  base: '/ringcraftlab-tool/',
})

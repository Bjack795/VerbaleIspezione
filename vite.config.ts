import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
    manifest: {
      name: 'Verbale di Ispezione',
      short_name: 'Verbale',
      description: 'Applicazione per la gestione dei verbali di ispezione',
      theme_color: '#ffffff',
      start_url: '/VerbaleIspezione/',
      icons: [
        {
          src: '/VerbaleIspezione/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/VerbaleIspezione/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    devOptions: {
      enabled: true
    }
  })],
  base: '/VerbaleIspezione/', // Nome del repository
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    https: true
  }
})

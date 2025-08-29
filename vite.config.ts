import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Determina se stiamo buildando per Electron o Tauri
const isElectron = process.env.VITE_ELECTRON === 'true'
const isTauri = process.env.VITE_TAURI === 'true'
const isDesktop = isElectron || isTauri

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: isDesktop ? 'prompt' : 'autoUpdate',
      disable: isDesktop,
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Verbale di Ispezione',
        short_name: 'Verbale',
        description: 'Verbale di Ispezione Redesco Progetti',
        theme_color: '#ffffff',
        display: 'standalone',
        start_url: isDesktop ? './' : '/VerbaleIspezione/',
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
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3 MB invece del default 2 MB
        navigateFallback: isDesktop ? '/index.html' : '/VerbaleIspezione/index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,gif,txt}'],
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|txt)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-resources',
            },
          },
        ],
      }
    })
  ],
  // Base path: relativo per desktop, assoluto per GitHub Pages
  base: isDesktop ? './' : '/VerbaleIspezione/',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: isDesktop,
        drop_debugger: isDesktop,
      },
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks: isDesktop ? undefined : {
          vendor: ['react', 'react-dom'],
          pdf: ['@react-pdf/renderer', 'pdf-lib']
        },
        assetFileNames: 'assets/[name][extname]',
        chunkFileNames: 'assets/[name].js',
        entryFileNames: 'assets/[name].js'
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true
  }
})

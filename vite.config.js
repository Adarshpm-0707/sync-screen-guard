import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    host: true,
    port: 5173,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    },
    watch: {
      usePolling: true
    }
  },
  preview: {
    port: 5173,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
  },
  build: {
    // 1. STRICTLY DISABLE SOURCE MAPS in production to prevent reverse-engineering
    sourcemap: false,
    
    // 2. High-grade Terser code minification, obfuscation & dead code elimination
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Strips all console.log/info/debug calls
        drop_debugger: true, // Strips all debugger statements
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace', 'console.warn'],
        passes: 2, // Multi-pass optimization
        dead_code: true
      },
      mangle: {
        toplevel: true, // Mangle top-level variable & function names
        safari10: true
      },
      format: {
        comments: false // Completely strip all source comments & metadata
      }
    },

    // 3. Rollup Chunk Splitting & Entropy Naming
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('lucide-react') || id.includes('framer-motion') || id.includes('recharts') || id.includes('gsap')) {
              return 'vendor-ui';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            return 'vendor-libs';
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 1000
  }
})

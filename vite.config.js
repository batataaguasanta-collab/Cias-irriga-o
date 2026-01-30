import path from "path"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./src"),
    },
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
  },
  build: {
    chunkSizeWarningLimit: 1000, // Aumenta o limite para 1000kb
    rollupOptions: {
      output: {
        manualChunks: {
          // Separa React e React-DOM em chunk próprio
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Separa bibliotecas UI em chunk próprio
          'ui-vendor': ['lucide-react', 'react-hot-toast'],
          // Separa Supabase em chunk próprio
          'supabase-vendor': ['@supabase/supabase-js'],
        },
      },
    },
  },
});

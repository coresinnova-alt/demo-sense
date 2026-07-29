import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': r('./src'),
      '@sense/tokens': r('../../packages/tokens/src/index.ts'),
      '@sense/core': r('../../packages/core/src/index.ts'),
      '@sense/mock': r('../../packages/mock/src/index.ts'),
      '@sense/ui': r('../../packages/ui/src/index.ts'),
      '@sense/store': r('../../packages/store/src/index.ts'),
    },
  },
  server: { port: 5173, open: false },
  build: { outDir: 'dist', sourcemap: false },
})

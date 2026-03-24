import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: ['textforge-production-4d6b.up.railway.app'],
    host: true,
    port: 4173,
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,      // <--- Aici forțezi portul 3000
    strictPort: true, // (Opțional) Dacă portul 3000 e ocupat, dă eroare (nu trece pe 3001)
    host: true       // (Opțional) Permite accesul și din Docker dacă va fi cazul
  }
})
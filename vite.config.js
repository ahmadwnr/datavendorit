import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
base: "/datavendorit/",
export default defineConfig({
  plugins: [react()],
})

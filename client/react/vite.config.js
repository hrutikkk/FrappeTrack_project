import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "./",
  // server: {
  //   proxy: {
  //     "/api": {
  //       target: "http://192.168.0.32:8000",
  //       changeOrigin: true,
  //     },
  //   },
  // },
})

import fs   from 'fs'
import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window'
  },
    server: {
    host: true, 
    port: 5173,             
    strictPort: true,   
 
  }
  
})

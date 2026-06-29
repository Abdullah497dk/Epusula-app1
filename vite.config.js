import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Göreceli yol: hem alt klasörde (cPanel) hem de WebView (file://) altında
  // asset yollarının kırılmamasını sağlar.
  base: './',
  plugins: [react()],
})

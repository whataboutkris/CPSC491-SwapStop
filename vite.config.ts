import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  test: {
    globals: true,                 // allows using "describe", "test", etc. without imports
    environment: 'happy-dom',          // simulates a browser environment for React components
    setupFiles: './src/setupTests.ts', // file for test setup (e.g. extending expect with jest-dom)
    css: true,                     // allows importing CSS/Tailwind styles in tests
  },
})
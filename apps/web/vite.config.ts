/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The paths the server answers: the API, signing in with Entra ID and signing out. The Host header
// is kept (no changeOrigin), so the server builds the sign-in redirect for this address.
const serverPaths = ['/api', '/oauth2', '/login/oauth2', '/logout']
const server = process.env.DEFIRO_SERVER ?? 'http://localhost:8080'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy: Object.fromEntries(serverPaths.map((path) => [path, server])) },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    reporters: ['default', 'junit'],
    outputFile: { junit: './reports/junit.xml' },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**'],
    },
  },
})

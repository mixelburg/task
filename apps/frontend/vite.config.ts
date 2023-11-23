/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import fs from 'fs'
import { resolve } from 'path'
import commonjs from 'vite-plugin-commonjs'

const httpsConfig = fs.existsSync(__dirname + '/.cert/cert.pem')
  ? {
    key: fs.readFileSync(__dirname + '/.cert/key.pem'),
    cert: fs.readFileSync(__dirname + '/.cert/cert.pem'),
  }
  : undefined

export default defineConfig({
  cacheDir: '../../node_modules/.vite/frontend',

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    https: httpsConfig,
    port: 8888,
    host: '127.0.0.1',
  },
  publicDir: 'assets',

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [
    react(),
    viteTsConfigPaths({
      root: '../../',
    }),
    commonjs(),
  ],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [
  //    viteTsConfigPaths({
  //      root: '../../',
  //    }),
  //  ],
  // },

  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
})

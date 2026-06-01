import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: 'example',
  test: {
    environment: 'jsdom',
    globals: true,
    passWithNoTests: true,
    setupFiles: ['./test/setup.js'],
    include: ['src/**/*.test.{js,jsx}', 'test/**/*.test.{js,jsx}']
  }
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Served from https://<user>.github.io/vcard-pro-emd/ (a project page,
  // not a custom domain) — relative base keeps asset URLs working no
  // matter what subpath the site is mounted under.
  base: './',
});

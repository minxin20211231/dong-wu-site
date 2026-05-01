import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://dong-wu.com',
  build: {
    format: 'directory',
  },
  trailingSlash: 'always',
});

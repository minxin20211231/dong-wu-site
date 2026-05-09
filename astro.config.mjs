import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://dong-wu.com',
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/posts/D001') && !page.includes('/posts/D002'),
    }),
  ],
  build: {
    format: 'directory',
  },
  trailingSlash: 'always',
});

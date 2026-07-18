import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://dong-wu.com',
  integrations: [
    sitemap({
      // /toolbox 三頁＝軟上線（noindex），正式開放時移除這三條
      filter: (page) =>
        !page.includes('/posts/D001') &&
        !page.includes('/posts/D002') &&
        !page.includes('/toolbox') &&
        !page.includes('/budget-kit') &&
        !page.includes('/inventory-worksheet'),
    }),
  ],
  build: {
    format: 'directory',
  },
  trailingSlash: 'always',
});

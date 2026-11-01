import {defineConfig} from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Pages are built as /path.html so Cloudflare serves them at /path (no trailing slash), which is the form the
// App Store listings use (e.g. https://www.tryino.com/privacy/ino-loyalty-shopify). The site lives on www; the bare domain
// should redirect there (Cloudflare).
export default defineConfig({
  site: 'https://www.tryino.com',
  trailingSlash: 'never',
  build: {format: 'file'},
  i18n: {
    locales: ['en', 'tr'],
    defaultLocale: 'en',
    routing: {prefixDefaultLocale: false},
  },
  integrations: [
    sitemap({
      // Hidden pages stay out of the sitemap (they also carry noindex).
      filter: (page) => !/\/(pricing|play\/badge)/.test(page),
      i18n: {defaultLocale: 'en', locales: {en: 'en-US', tr: 'tr-TR'}},
    }),
  ],
});

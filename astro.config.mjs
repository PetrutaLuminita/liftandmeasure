import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://liftandmeasure.com',
  // One URL per page, with NO trailing slash, site-wide (e.g. /tdee-calculator
  // and /, never /tdee-calculator/). This keeps canonical tags, internal
  // links, and the generated sitemap all in the same form, and vercel.json
  // ("trailingSlash": false) 308-redirects the slash variant to it so a
  // page is never reachable at two URLs.
  trailingSlash: 'never',
  integrations: [sitemap()],
});

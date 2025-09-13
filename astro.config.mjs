// @ts-check
import { defineConfig } from "astro/config";

import vue from "@astrojs/vue";
import { remarkReadingTime } from "./src/scripts/readingTime";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  server: {
    port: 3000,
  },
  site: "https://szymonszadkowski.com",
  trailingSlash: "never",
  markdown: {
    remarkPlugins: [remarkReadingTime],
  },
  integrations: [vue(), sitemap()],
});
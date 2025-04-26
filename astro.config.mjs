// @ts-check
import { defineConfig } from "astro/config";

import vue from "@astrojs/vue";

// https://astro.build/config
export default defineConfig({
    site: "https://naqet.github.io",
    base: "/portfolio",
    server: {
        port: 3000,
    },

    integrations: [vue()],
});

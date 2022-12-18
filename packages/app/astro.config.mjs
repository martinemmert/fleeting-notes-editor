import { defineConfig } from "astro/config";
import solid from "@astrojs/solid-js";
import alpine from "@astrojs/alpinejs";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [solid(), alpine(), tailwind()],
});

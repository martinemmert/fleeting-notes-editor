import { defineConfig } from "astro/config";
import solid from "@astrojs/solid-js";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [solid(), tailwind()],
  adapter: vercel(),
});

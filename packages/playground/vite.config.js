// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  css: {
    postcss: {
      plugins: [require("postcss-nested")],
    },
  },
});

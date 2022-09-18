// vite.config.js
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "@fleeting-notes/editor",
      // the proper extensions will be added
      fileName: "fleeting-notes__editor",
      formats: ["es", "cjs"],
    },
  },
  test: {
    setupFiles: resolve(__dirname, "vitest.setup.ts"),
  },
});

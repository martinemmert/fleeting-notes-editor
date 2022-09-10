// vite.config.js
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/create-json-view.ts"),
      name: "@fleeting-notes/editor",
      // the proper extensions will be added
      fileName: "fleeting-notes__editor",
      formats: ["es", "cjs"],
    },
  },
});

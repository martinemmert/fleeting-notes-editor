import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    reporters: "verbose",
    outputTruncateLength: 120,
    outputDiffLines: 100,
  },
});

import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

const page = (path) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  base: "/kana-collector/",
  build: {
    rollupOptions: {
      input: {
        home: page("./index.html"),
        collector: page("./collector/index.html"),
        memory: page("./memory/index.html"),
      },
    },
  },
});

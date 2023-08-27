import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import plugin from "./src/framework/vite-plugin";

export default defineConfig({
  plugins: [
    plugin({
      builderIn: "playground/plugin/builder/",
      queryOut: "playground/plugin/queries/",
    }),
  ],
  server: {
    watch: {
      ignored: ["./src/"],
    },
  },

  resolve: {
    alias: {
      src: fileURLToPath(new URL("./src", import.meta.url)),
      "~": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
});

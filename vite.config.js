import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import plugin from "./src/framework/vite-plugin";
import { BarrelExporter } from "./src/framework/barrel-exporter";

export default defineConfig({
  plugins: [
    plugin({
      builderIn: "playground/plugin/builder/",
      queryOut: "playground/plugin/queries/",
      schemaOut: "playground/plugin/schema/",
      listener: [(ctx) => new BarrelExporter(ctx)],
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

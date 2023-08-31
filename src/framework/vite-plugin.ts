import { type Plugin } from "vite";
import { SanityComposer, FrameworkOptions } from "./core-framework";

export default function VitePluginSanityDatacomposer(options: FrameworkOptions): Plugin {
  return {
    apply: "serve",
    name: "sanity-composer",
    configureServer(server) {
      new SanityComposer(options, server.watcher);
    },
  } as const satisfies Plugin;
}

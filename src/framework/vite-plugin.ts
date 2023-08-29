import { type Plugin } from "vite";
import { SanityComposer } from "./core-framework";

export interface Options {
  builderIn: string;
  queryOut: string;
}

export default function VitePluginSanityDatacomposer(options: Options): Plugin {
  return {
    apply: "serve",
    name: "sanity-composer",
    configureServer(server) {
      new SanityComposer(options, server.watcher);
    },
  } as const satisfies Plugin;
}

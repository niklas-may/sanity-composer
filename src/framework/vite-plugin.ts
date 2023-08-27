import { type Plugin } from "vite";
import { Framework } from "./main";

export interface Options {
  builderIn: string;
  queryOut: string;
  schmeaOut: string;
}

export default function VitePluginSanityDatacomposer(options: Options): Plugin {
  return {
    apply: "serve",
    name: "sanity-datacomposer",
    configureServer(server) {
      new Framework(options, server.watcher);
    },
  } as const satisfies Plugin;
}

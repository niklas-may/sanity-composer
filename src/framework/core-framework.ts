import path from "path";
import { readdirSync, statSync } from "fs";
import { register } from "ts-node";
import chokidar from "chokidar";
import { FileWriter, FileContainer, Logger, EventBus, EventHandlerContext, EventHandler } from "./library";
import { QueryWriter } from "./query-writer";
import { BarrelExporter } from "./barrel-exporter";

export interface FrameworkOptions {
  builderIn: string;
  queryOut: string;
  schemaOut: string;
  listener?: Array<ListenerFactory>;
}

export interface SanityComposerFrameworkEvents {
  add: [filePath: string];
  change: [filePath: string];
  unlink: [filePath: string];
  ready: [];
}

export type ListenerFactory = (ctx: EventHandlerContext) => any;

export class SanityComposer {
  options: FrameworkOptions;
  watcher: chokidar.FSWatcher;
  files: FileContainer;
  listener: Array<EventHandler> = [];
  writer = new FileWriter();
  tsService: ReturnType<typeof register>;
  logger = new Logger();
  eventBus = new EventBus<SanityComposerFrameworkEvents>();

  constructor(userOptions: FrameworkOptions, watcher: chokidar.FSWatcher) {
    this.options = {
      builderIn: this.#normalizePath(userOptions.builderIn),
      queryOut: this.#normalizePath(userOptions.queryOut),
      schemaOut: this.#normalizePath(userOptions.schemaOut),
    };

    this.files = new FileContainer(this.options.builderIn);
    this.#loadAllFiles();

    const listenerTemp: Array<ListenerFactory> = [(ctx) => new QueryWriter(ctx), (ctx) => new BarrelExporter(ctx)];
    if (userOptions.listener) userOptions.listener.forEach((l) => listenerTemp.push(l));

    this.#setupListener(listenerTemp);

    this.watcher = watcher;
    watcher.on("all", (event, path) => {
      switch (event) {
        case "add":
        case "change":
        case "unlink":
          if (path.includes(this.options.builderIn) && path.includes(".ts")) {
            this.eventBus.emit(event, path);
          }
      }
    });

    this.tsService = register({
      compilerOptions: {
        module: "CommonJS",
      },
      require: ["tsconfig-paths/register"],
      typeCheck: false,
      transpileOnly: true,
    });

    this.eventBus.emit("ready");
  }

  #normalizePath(relativePath: string) {
    return path.resolve(process.cwd(), relativePath);
  }

  #loadAllFiles() {
    function getAllFilePaths(directoryPath: string) {
      const filePaths: Array<string> = [];

      const files = readdirSync(directoryPath);

      files.forEach((file) => {
        const filePath = path.join(directoryPath, file);

        const isFile = statSync(filePath).isFile();

        if (isFile) {
          filePaths.push(filePath);
        } else {
          const nestedFilePaths = getAllFilePaths(filePath);
          filePaths.push(...nestedFilePaths);
        }
      });

      return filePaths.filter((p) => p.includes(".ts"));
    }

    const paths = getAllFilePaths(this.options.builderIn);

    paths.forEach((f) => {
      this.files.add(f);
    });
  }

  #setupListener(handler?: Array<ListenerFactory>) {
    /* Allways run these first */
    this.eventBus.on("add", (filePath) => this.files.add(filePath));
    this.eventBus.on("change", (filePath) => this.files.get(filePath)?.setDirty());

    /* Allways run these in the middle */
    if (handler) {
      handler.forEach((handler) =>
        this.listener.push(
          handler({ files: this.files, options: this.options, writer: this.writer, eventBus: this.eventBus })
        )
      );
    }

    /* Allway run these last*/
    this.eventBus.on("unlink", (filePath) => this.files.remove(filePath));
  }
}

import { EventHandlerDependencies, EventHandler } from "./library/event-handler";
import path from "path";
import { readdirSync, statSync } from "fs";
import { register } from "ts-node";
import chokidar from "chokidar";
import { FileWriter, FileContainer, Logger, EventBus } from "./library";
import { QueryWriter } from "./query-writer";

export interface FrameworkOptions {
  builderIn: string;
  queryOut: string;
}

export interface SanityComposerFrameworkEvents {
  add: [filePath: string];
  change: [filePath: string];
  unlink: [filePath: string];
  ready: [];
}

export class Framework {
  options: FrameworkOptions;
  watcher: chokidar.FSWatcher;
  files: FileContainer;
  listener: Array<EventHandler<SanityComposerFrameworkEvents>> = [];
  writer = new FileWriter();
  tsService: ReturnType<typeof register>;
  logger = new Logger();
  eventBus = new EventBus<SanityComposerFrameworkEvents>();

  constructor(userOptions: FrameworkOptions, watcher: chokidar.FSWatcher) {
    this.options = {
      builderIn: this.#normalizePath(userOptions.builderIn),
      queryOut: this.#normalizePath(userOptions.queryOut),
    };


    this.files = new FileContainer(this.options.builderIn);
    this.#loadAllFiles();

    this.#setupListener([(ctx) => new QueryWriter(ctx)]);

    this.watcher = watcher;
    watcher.on("all", (event, path) => {
      switch (event) {
        case "add":
        case "change":
        case "unlink":
          this.eventBus.emit(event, path);
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

    this.eventBus.emit('ready')
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

  #setupListener(handler?: Array<(ctx: EventHandlerDependencies<SanityComposerFrameworkEvents>) => any>) {
    /* Allway run these first */
    this.eventBus.on("add", (filePath) => this.files.add(filePath));
    this.eventBus.on("change", (filePath) => this.files.get(filePath)?.setDirty());
    
    /* Allway run these in the middle */
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

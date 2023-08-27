import path from "path";
import { readdirSync, statSync } from "fs";
import { register } from "ts-node";
import chokidar from "chokidar";
import { FileWriter, FileContainer, EventHandlerInterface, Logger } from "./library";
import { QueryWriter } from "./query-writer";

export interface FrameworkOptions {
  builderIn: string;
  queryOut: string;
}

type SupportedChokidarEvent = "add" | "change" | "unlink";
type Event = "ready" | SupportedChokidarEvent;

export class Framework {
  options: FrameworkOptions;
  watcher: chokidar.FSWatcher;
  files: FileContainer;
  listener: Array<EventHandlerInterface> = [];
  writer = new FileWriter();
  tsService: ReturnType<typeof register>;
  logger = new Logger().setLogLevel("warn");

  constructor(userOptions: FrameworkOptions, watcher: chokidar.FSWatcher) {
    this.options = {
      builderIn: this.#normalizePath(userOptions.builderIn),
      queryOut: this.#normalizePath(userOptions.queryOut),
    };

    this.files = new FileContainer(this.options.builderIn);
    this.addListener(new QueryWriter({ writer: this.writer, files: this.files, options: this.options }));
    this.#loadAllFiles();

    this.watcher = watcher;
    watcher.on("all", (event, path) => {
      switch (event) {
        case "add":
        case "change":
        case "unlink":
          this.emit(event, path);
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

    this.emit("ready", "");
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

      return filePaths.filter(p => p.includes('.ts'));
    }

    const paths = getAllFilePaths(this.options.builderIn);

    paths.forEach((f) => {
      this.files.add(f);
    });
  }

  addListener(listener: EventHandlerInterface | Array<EventHandlerInterface>) {
    if (Array.isArray(listener)) {
      listener.forEach((l) => this.listener.push(l));
    } else {
      this.listener.push(listener);
    }
  }

  emit(type: Event, filePath: string) {
    if (filePath ? !filePath.includes(this.options.builderIn) && filePath.includes('.ts') : false) return;

    this.logger.log(`${type} ${filePath}`);

    this.listener.forEach((l) => {
      switch (type) {
        case "add":
          this.files.add(filePath);
          if (l.onAdd) return l.onAdd(filePath);
          break;
        case "change":
          this.files.get(filePath)?.setDirt();
          if (l.onChange) l.onChange(filePath);
          break;
        case "unlink":
          if (l.onUnlink) l.onUnlink(filePath);
          break;
        case "ready":
          if (l.onReady) l.onReady();
          break;
      }
    });

    if (type === "unlink") {
      this.files.remove(filePath);
    }
  }
}

import path from "path";
import { unlinkSync } from "fs";
import { FileNode, EventHandler, EventHandlerContext, Logger } from "./library";

export class QueryWriter extends EventHandler {
  logger: Logger;

  constructor(ctx: EventHandlerContext) {
    super(ctx);
    this.logger = new Logger("Query Writer");

    this.eventBus.on("change", async (filePath) => await this.onChange(filePath));
    this.eventBus.on("unlink", (filePath) => this.onUnlink(filePath));
    this.eventBus.on("ready", async () => await this.onReady());
  }

  async getPrettyQuery(file: FileNode) {
    return await this.fileWriter.prettifyGroq(file.program?.default.getQuery() ?? "");
  }

  getQueryFilePath(file: FileNode) {
    return path.join(this.options.queryOut, path.basename(file.filePath));
  }

  writeQuery(filePath: string, query: string) {
    if (!query) return;
    const code = `export default /* groq */\`\n${query}\``;
    this.fileWriter.writeTypeScript(filePath, code);
    this.logger.log(`Exported query ${path.basename(filePath)}`);
  }

  async onChange(filePath: string) {
    const file = this.files.get(filePath);

    if (file?.type === "document") {
      const query = await this.getPrettyQuery(file);

      this.writeQuery(this.getQueryFilePath(file), query);
      this.logger.log(`Exported query ${file.basename}`);
      return;
    } else {
      file?.walkUp(async (pFile) => {
        if (pFile.type === "document") {
          const query = await this.getPrettyQuery(pFile);
          this.writeQuery(this.getQueryFilePath(pFile), query);
        }
      });
    }
  }

  async onReady() {
    this.files.files.forEach(async (file) => {
      if (file.type === "document") {
        const query = await this.fileWriter.prettifyGroq(file.program?.default.getQuery() ?? "");
        const queryFilePath = this.getQueryFilePath(file);

        const queryOnDisk = this.fileWriter.checkFileExists(queryFilePath) && require(queryFilePath)?.default;

        if (queryOnDisk) {
          /**
           * TODO: Functionality is flaky... neds some investigation
           */
          const isEqual = query.trim().replace(/\s/g, "") === queryOnDisk.trim().replace(/\s/g, "");

          if (!isEqual) {
            this.writeQuery(queryFilePath, query);
          }
        } else {
          this.writeQuery(queryFilePath, query);
        }
      }
    });
  }

  onUnlink(filePath: string) {
    this.logger.log("unlink", filePath);
    const queryFilePath = this.getQueryFilePath(this.files.get(filePath)!);

    try {
      unlinkSync(queryFilePath);
    } catch (e: any) {}
  }
}

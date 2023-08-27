import path from "path";
import { unlinkSync } from "fs";
import { FileNode } from "./library/file-container";
import { EventHandler, EventHandlerInterface, EventHandlerDependencies, Logger } from "./library";

export class QueryWriter extends EventHandler implements EventHandlerInterface {
  logger: Logger;

  constructor(dI: EventHandlerDependencies) {
    super(dI);
    this.logger = new Logger("Query Writer");
  }

  log(...args: any[]) {
    this.logger.log(...args);
  }

  async getPrettyQuery(file: FileNode) {
    return await this.fileWriter.prettifyGroq(file.program?.default.getQuery() ?? "");
  }

  getQueryFilePath(file: FileNode) {
    return path.join(this.options.queryOut, path.basename(file.filePath));
  }

  writeQuery(filePath: string, query: string) {
    const code = `export default /* groq */\`\n${query}\``;
    this.fileWriter.writeTypeScript(filePath, code);
  }

  async onChange(filePath: string) {
    const file = this.files.get(filePath);

    if (file?.type === "document") {
      const query = await this.getPrettyQuery(file);

      this.writeQuery(this.getQueryFilePath(file), query);
    }

    file?.walkUp(async (pFile) => {
      if (pFile.type === "document") {
        const query = await this.getPrettyQuery(pFile);

        this.writeQuery(this.getQueryFilePath(pFile), query);
      }
    });
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
            this.log(`On Ready: Query of ${file.basename} changed. Writing updated version to disk.`);
            this.writeQuery(queryFilePath, query);
          }
        } else {
          this.log(`On Ready: Writing query for ${file.basename}.`);
          this.writeQuery(queryFilePath, query);
        }
      }
    });
  }

  onUnlink(filePath: string) {
    const queryFilePath = this.getQueryFilePath(this.files.get(filePath)!);

    try {
      unlinkSync(queryFilePath);
    } catch (e: any) {}
  }
}

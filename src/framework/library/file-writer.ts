import { existsSync, mkdirSync, promises , constants, accessSync} from "fs";
import * as prettier from "prettier";
// Todo: Add Prettier config https://prettier.io/docs/en/api.html
import { format } from "groqfmt-nodejs";
import path from "path";

export class FileWriter {
  header: string;

  constructor(header?: string) {
    const defaultHeader = [
      "/* DO NOT CHANGE",
      " *",
      ` * Autogenerated with Sanity Composter via package script "${process.env.npm_lifecycle_event}"`,
      ` * on ${new Date().toLocaleTimeString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`,
      " */",
      ""
    ];

    this.header = header ?? defaultHeader.join("\n");
  }

  checkFileExists(filePath: string) {
    try {
      accessSync(filePath, constants.F_OK);
      return true; // File exists
    } catch (err) {
      return false; // File does not exist
    }
  }

  ensureDirectoriesExist(filePath: string) {
    const dirname = path.dirname(filePath);
    if (existsSync(dirname)) {
      return true;
    }

    this.ensureDirectoriesExist(dirname);
    mkdirSync(dirname);
  }

  async prettifyTypeScript(code: string) {
    return await prettier.format(code, { parser: "babel-ts" });
  }

  async prettifyGroq(code: string) {
    return await format(String(code).trim());
  }

  async writeTypeScript(filePath: string, code: string) {
    this.ensureDirectoriesExist(filePath);
    const content = [this.header, code].join("\n");
    await promises.writeFile(filePath, content);
  }
}

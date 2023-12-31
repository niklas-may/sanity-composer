import { existsSync, mkdirSync, promises, constants, accessSync } from "fs";
import * as prettier from "prettier";
import { format } from "groqfmt-nodejs";
import path from "path";
import { Logger } from "./logger";
import chalk from "chalk";

// Todo: Add Prettier config https://prettier.io/docs/en/api.html
export class FileWriter {
  header: string;
  logger: Logger;

  constructor(header?: string) {
    const defaultHeader = [
      "/* DO NOT CHANGE",
      ` * Autogenerated with Sanity Composer via package script "${process.env.npm_lifecycle_event}"`,
      " */",
      "",
    ];

    this.header = header ?? defaultHeader.join("\n");
    this.logger = new Logger();
  }

  checkFileExists(filePath: string) {
    try {
      accessSync(filePath, constants.F_OK);
      return true;
    } catch (err) {
      return false;
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
    try {
      return await format(String(code).trim());
    } catch (e: any) {
      function getPart(str: string, regex: RegExp) {
        const match = str?.match(regex);
        const msg = match ? match[1] : null;

        return msg;
      }

      function getIndex(input: string) {
        const regex = /positions (\d+)\.\.(\d+)/;
        const match = input.match(regex);

        if (match) {
          const startPosition = parseInt(match[1]);
          const endPosition = parseInt(match[2]);

          if (!startPosition || !endPosition) return false;
          const capturedText = [startPosition, endPosition];
          return capturedText;
        } else {
          console.log("No match found.");
        }
      }

      function highlightWithChalk(text: string, index: number, indexEnd: number) {
        const highlightedText =
          text.substring(0, index) +
          chalk.bgRedBright.white(text.substring(index, indexEnd)) +
          text.substring(indexEnd + 1);
        return highlightedText;
      }

      const query = getPart(String(e), /echo\s+"([^"]+)"/);
      const msg = getPart(String(e), /parsing query:\s+parse\s+error\s(.+)/);
      const range = getIndex(String(e));

      const queryHighlighted = query && Array.isArray(range) ? highlightWithChalk(query, range[0], range[1]) : query;

      this.logger.error("Groq Syntx Errror", msg, queryHighlighted);

      return "";
    }
  }

  async writeTypeScript(filePath: string, code: string) {
    this.ensureDirectoriesExist(filePath);
    const content = [this.header, await this.prettifyTypeScript(code)].join("\n");
    return await promises.writeFile(filePath, content);
  }
}

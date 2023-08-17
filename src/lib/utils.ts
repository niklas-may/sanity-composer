import fs from "fs";
import util from "util";
import * as prettier from "prettier";

export function writeFile(filePath: string, content: string) {
  const fileExists = fs.existsSync(filePath);
  fs.writeFileSync(filePath, content, { flag: fileExists ? "w" : "wx" });
}

export async function prettyWriteTsFile(filePath: string, content: string) {
  const comment = `
  /* Autogenerated. Don't touch! */\n
  `;
  const prettyConent = await prettier.format(content, { parser: "babel-ts" });
  writeFile(filePath, `${comment}${prettyConent}`);
}

export function log(args) {
  console.log(util.inspect(args, false, null));
}

export async function prettifiyTs(str: string) {
  return await prettier.format(str, { parser: "babel-ts" });
}

export async function prettifiyGroq(str: string) {
  const res = await prettier.format(str, { parser: "groq-parse", plugins: ["prettier-plugin-groq"] });
  return res;
}

import { prettyWriteTsFile, prettifiyGroq } from "./lib/utils";
import chokidar from "chokidar";
import p, { basename, dirname } from "path";
import { readFileSync, readdirSync } from "fs";
import { Builder } from "./lib/builder";

import dependencyTree from "dependency-tree";

async function handleBuilderChange(document: Builder, path: string) {
  const name = basename(path).split(".ts").shift();

  const schameFileName = `${name}.schema.ts`;
  const schemaName = `${document.name.toLowerCase()}Schema`;

  prettyWriteTsFile(
    p.resolve(document.schemaType === "document" ? config.documentSchemaOut : config.objectSchemaOut, schameFileName),
    `export const ${schemaName} = ${document.getSchemaString()}`
  );

  const queryFileName = `${name}.query.ts`;
  const queryName = `${document.name.toLowerCase()}Query`;

  prettyWriteTsFile(
    p.resolve(config.queryOut, queryFileName),
    `export const ${queryName}= /* groq */\`\n ${await prettifiyGroq(document.getQuery())}\``
  );
}

function createConfig() {
  const configPath = p.resolve(process.cwd(), "builder.json");
  let config = {
    builderIn: "src/builder/",
    schmeaOut: "src/schema/",
    queryOut: "src/query/",
    documentSchemaOut: "",
    objectSchemaOut: "",
  };

  try {
    const userConfig = JSON.parse(readFileSync(configPath, "utf-8"));
    config = { ...config, ...userConfig };
  } catch (e: any) {
    console.log("error", e);
  }

  config.documentSchemaOut = `${config.schmeaOut}documents/`;
  config.objectSchemaOut = `${config.schmeaOut}objects/`;

  return config;
}

async function processFile(filePath: string) {
  try {
    const file = await import(filePath);

    if (file.document) {
      handleBuilderChange(file.document, filePath);
    }
  } catch (e: any) {
    console.log(e);
  }
}

const config = createConfig();
const files = new Set();
chokidar.watch(config.builderIn).on("all", async (event, path, stats) => {
  const filePath = p.resolve(process.cwd(), path);

  if (event === "add") {
    files.add(filePath);
    processFile(filePath);
  }
  if (event === "unlink") {
    files.delete(filePath);
  }

  if (event === "change") {

    const updateList = [];

    files.forEach((file) => {
      const tree = dependencyTree
        .toList({
          filename: file as string,
          directory: config.builderIn,
          filter: (path) => path.indexOf("node_modules") === -1, // optional
        })
        .filter((f) => f !== file);

      if (tree.includes(filePath)) {
        updateList.push(file);
      }
    });

    delete require.cache[filePath as string];
    processFile(filePath as string);

    updateList.forEach((fp) => {
      delete require.cache[fp as string];
      processFile(fp as string);
    });
  }
});

chokidar.watch([config.documentSchemaOut, config.objectSchemaOut, config.objectSchemaOut]).on("add", (path, event) => {
  const dir = dirname(path);

  const files = readdirSync(dirname(path));

  const content = files
    .filter((f) => f !== "index.ts")
    .map((file) => `export * from './${file.split(".ts").shift()}'`)
    .join("\n");

  prettyWriteTsFile(`${dir}/index.ts`, content);
});

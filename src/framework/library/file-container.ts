import dependencyTree from "dependency-tree";
import path from "path";
import { Builder } from "src/library/builder";

type FilePath = string;
type Files = Map<FilePath, FileNode>;

export class FileNode {
  #files: Files;

  filePath: string;
  parents: Set<FilePath> = new Set();
  children: Set<FilePath> = new Set();

  dirty = true;

  #programData: {default: Builder} | undefined;

  constructor(filePath: string, files: Files) {
    this.filePath = filePath;
    this.#files = files;
  }

  get basename() {
    return path.basename(this.filePath);
  }

  get type(){
   return this.program?.default?.schemaType
  }

  get name(){
    return this.program?.default.name
  }

  get program() {
    if (!this.#programData || this.dirty) {
      if (this.dirty) {
        delete require.cache[this.filePath];
      }

      this.#programData = require(this.filePath);
    }
    return this.#programData;
  }

  setDirty() {
    this.dirty = true;
  }

  walkUp(callback: (parent: FileNode) => void) {
    this.parents.forEach((p) => {
      callback(this.#files.get(p)!);
      this.#files.get(p)?.walkUp(callback);
    });
  }
}

export class FileContainer {
  rootDir: string;
  files: Map<FilePath, FileNode> = new Map();

  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  #getDepenenciesFor(filePath: string) {
    const result: Array<string> = [];

    const tree = dependencyTree({
      filename: filePath as string,
      directory: this.rootDir,
      filter: (path) => path.indexOf("node_modules") === -1,
    }) as Record<string, any>;

    result.push(...Object.keys(tree[filePath]));

    return result;
  }

  #create(fP: FilePath) {
    const file = new FileNode(fP, this.files);
    this.files.set(fP, file);
    return file;
  }

  #getOrCreate(filePath: FilePath) {
    let file = this.files.get(filePath);

    if (!file) {
      file = this.#create(filePath);
    }
    return file;
  }

  get(filePath: FilePath) {
    return this.files.get(filePath);
  }

  add(filePath: FilePath) {
    const file = this.#getOrCreate(filePath);

    const dependencies = this.#getDepenenciesFor(filePath);

    dependencies.forEach((childPath) => {
      file.children.add(childPath);
      this.#getOrCreate(childPath).parents.add(filePath);
    });

    return file;
  }

  remove(fP: FilePath) {
    this.get(fP)?.children.forEach((cFP) => {
      this.get(cFP)?.parents.delete(fP);
    });

    return this.files.delete(fP);
  }
}

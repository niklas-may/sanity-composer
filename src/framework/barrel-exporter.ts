import path from "path";
import { EventHandler, EventHandlerContext, FileNode, Logger } from "./library";

type BarrelGroup = {
  type: "globalObject" | "document";
  imports: Set<string>;
  file: string;
};

export class BarrelExporter extends EventHandler {
  logger: Logger = new Logger("Barrel Exporter");
  groups: Array<BarrelGroup> = [];

  constructor(ctx: EventHandlerContext) {
    super(ctx);
 

    this.eventBus.on("ready", this.onReady.bind(this));
    this.eventBus.on("unlink", this.onUnlink.bind(this));
    this.eventBus.on("change", this.onChange.bind(this));
  }

  onReady() {
    this.groups.forEach((group) => {
      this.fileWriter.ensureDirectoriesExist(this.options.schemaOut);

      if (!this.fileWriter.checkFileExists(group.file)) {
        this.fileWriter.writeTypeScript(group.file, "");
      }

      this.files.files.forEach((file) => {
        if (file.type === group.type) {
          group.imports.add(file.filePath);
        }
      });

      this.writeExports(group);
    });
  }

  onChange(filePath: string) {
    const file = this.files.get(filePath);
    if (!file) return;

    this.groups.forEach((group) => {
      if (file.type === group.type) {
        this.processBarrelGroup(file, group);
      } else if (group.imports.has(file.filePath)) {
        group.imports.delete(file.filePath);
        this.writeExports(group);
      }
    });
  }

  onUnlink(filePath: string) {
    const deleted = this.groups.map((g) => g.imports.delete(filePath) && g);
    if (deleted.some(Boolean)) deleted.filter(Boolean).forEach((g) => this.writeExports(g));
  }

  writeExports(group: BarrelGroup) {
    const filesArray = Array.from(group.imports);
    const imports = filesArray
      .map(
        (d) =>
          `import ${this.files.get(d)?.name} from "${path.relative(this.options.schemaOut, d).split(".ts").shift()}"`
      )
      .join("\n");
    const exports = filesArray.map((d) => `${this.files.get(d)?.name}.getSchema()`).join(",\n");
    const code = `
    ${imports}
    
    export default [${exports}]
    `;

    this.fileWriter.writeTypeScript(group.file, code);
    this.logger.log("Updated Schema Exprts for:", path.basename(group.file));
  }

  processBarrelGroup(file: FileNode, group: BarrelGroup) {
    const isRegistered = group.imports.has(file.filePath);

    if (!isRegistered) {
      group.imports.add(file?.filePath);
    }
    this.writeExports(group);
  }
}

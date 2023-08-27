import { FrameworkOptions } from "../main";
import { FileContainer } from "./file-container";
import { FileWriter } from "./file-writer";

export interface EventHandlerInterface {
  onChange?: (filePath: string) => void;
  onAdd?: (filePath: string) => void;
  onUnlink?: (filePath: string) => void;
  onReady?: () => void
}

export type EventHandlerDependencies = { writer: FileWriter; files: FileContainer; options: FrameworkOptions };

export class EventHandler {
  fileWriter: FileWriter;
  files: FileContainer;
  options: FrameworkOptions;
  
  constructor(deps: EventHandlerDependencies) {
    this.fileWriter = deps.writer;
    this.files = deps.files;
    this.options = deps.options;
  }
}

import { FrameworkOptions, SanityComposerFrameworkEvents } from "../core-framework";
import { FileContainer, FileWriter, EventBus } from ".";

export type EventHandlerContext = {
  writer: FileWriter;
  files: FileContainer;
  options: FrameworkOptions;
  eventBus: EventBus<SanityComposerFrameworkEvents>;
};

export class EventHandler {
  fileWriter: FileWriter;
  files: FileContainer;
  options: FrameworkOptions;
  eventBus: EventBus<SanityComposerFrameworkEvents>;

  constructor(deps: EventHandlerContext) {
    this.fileWriter = deps.writer;
    this.files = deps.files;
    this.options = deps.options;
    this.eventBus = deps.eventBus;
  }
}

import { EventBus, EventShape } from './event-bus';
import { FrameworkOptions } from "../main";
import { FileContainer } from "./file-container";
import { FileWriter } from "./file-writer";



export type EventHandlerDependencies<Events extends EventShape> = { writer: FileWriter; files: FileContainer; options: FrameworkOptions; eventBus: EventBoker<Events> };

export class EventHandler<Events extends EventShape> {
  fileWriter: FileWriter;
  files: FileContainer;
  options: FrameworkOptions;
  eventBus: EventBus<Events>
  
  constructor(deps: EventHandlerDependencies<Events>) {
    this.fileWriter = deps.writer;
    this.files = deps.files;
    this.options = deps.options;
    this.eventBus = deps.eventBus
  }
}

import { EventHandler, EventHandlerContext } from "./library";

export class BarrelExporter extends EventHandler {
  constructor(ctx: EventHandlerContext) {
    super(ctx);

    // this.eventBus.on("change", (filePath) => {
    //   this.files.get(filePath)?.walkUp((file) => console.log(file.basename));
    // });
  }
}

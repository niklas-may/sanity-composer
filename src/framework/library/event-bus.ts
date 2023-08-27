import { EventEmitter } from "node:events";

export type EventShape = Record<string, any>

export class EventBus<Events extends EventShape> {
  private emitter = new EventEmitter();

  emit<EventName extends keyof Events & string>(eventName: EventName, ...eventArg: Events[EventName]) {
    this.emitter.emit(eventName, ...(eventArg as []));
  }

  on<EventName extends keyof Events & string>(
    eventName: EventName,
    handler: (...eventArg: Events[EventName]) => void
  ) {
    this.emitter.on(eventName, handler as any);
  }

  off<EventName extends keyof Events & string>(
    eventName: EventName,
    handler: (...eventArg: Events[EventName]) => void
  ) {
    this.emitter.off(eventName, handler as any);
  }
}


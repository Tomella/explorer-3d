import { EventDispatcher } from "../util/eventdispatcher";

export abstract class Pusher<T> extends EventDispatcher {
   complete: boolean;
   abstract push(line: string): boolean;
   abstract get obj(): T;

   constructor() {
      super();
      this.complete = false;
   }
}
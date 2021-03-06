import { Event } from "../domain/event";
import { Pipeline } from "./pipeline";
import { Logger } from "../util/logger";

/**
 * It just gobbles up the events until complete. Sort of a bit bucket.
 */
export class UnknownSink extends Pipeline {
   constructor() {
      super();
      Logger.warn("We don't understand this type but we'll soldier on.");
   }

   pipe(event: any): void {
      if (event.eventName === "complete") {
         this.dispatchEvent(new Event("complete", {}));
      }
   }
}
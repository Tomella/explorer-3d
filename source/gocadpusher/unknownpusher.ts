import { Unknown } from "../gocad/unknown";
import { Pusher } from "./pusher";

export class UnknownPusher extends Pusher<Unknown> {
   unknown: Unknown;
   /**
    * We come in here on the next line
    */
   constructor(public projectionFn?: Function) {
      super();
      this.unknown = new Unknown();
   }

   get obj() {
      return this.unknown;
   }

   push(line: string): boolean {
      if (line.trim() === "END") {
         this.complete = true;
      }
      return true;
   }
}
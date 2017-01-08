import { Pusher } from "./pusher";

export abstract class StatePusher<T> extends Pusher<T> {
   state: number;

   constructor() {
      super();
      this.state = 0;
   }
}
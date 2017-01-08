import { Pusher } from "./pusher";
import { Type } from "../gocad/type";

export class TypePusher extends Pusher<Type> {
   type: Type;

   /**
    * We come in here on the next line
    */
   constructor(public projectionFn?: Function) {
      super();
      this.type = new Type();
   }

   get obj(): Type {
      return this.type;
   }

   push(line: string): boolean {
      return false;
   }
}
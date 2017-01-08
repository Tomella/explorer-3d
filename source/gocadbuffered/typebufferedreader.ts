import { atom } from "../gocad/atom";
import { LineBufferedReader } from "../util/linebufferedreader";
import { Type } from "../gocad/type";

export class TypeBufferedReader  {

   /**
    * We come in here on the next line
    */
   constructor(public reader: LineBufferedReader, public projectionFn?: Function) {
   }

   async read(): Promise<Type> {
      return new Type();
   }
}

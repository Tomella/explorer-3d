import * as util from "../util/linereader";
import * as type from "./type";


export class Unknown extends type.Type {
   public type: string = "Unknown";
   public name: string;
   public version: string;

   /**
    * We come in here on the next line
    */
   constructor(reader: util.LineReader, projectionFn?: Function) {
      super(reader, projectionFn);
      while (reader.hasMore()) {
         let line: string = reader.next().trim();
         if (line === "END") {
            break;
         }
      }
      this.clear();
   }
}
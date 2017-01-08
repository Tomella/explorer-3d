import { LineBufferedReader } from "../util/linebufferedreader";
import { Unknown } from "../gocad/unknown";


export class UnknownBufferedReader {
   /**
    * We come in here on the next line
    */
   constructor(public reader: LineBufferedReader, public projectionFn?: Function) {
   }

   async read(): Promise<Unknown> {
      let unknown = new Unknown();
      while (this.reader.hasMore()) {
         let line: string = (await this.reader.next()).trim();
         if (line === "END") {
            break;
         }
      }
      return unknown;
   }
}
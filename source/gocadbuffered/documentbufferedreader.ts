import { LineBufferedReader } from "../util/linebufferedreader";
import { TypeFactoryBufferedReader } from "./typefactorybufferedreader";
import { Document } from "../gocad/document";

export class DocumentBufferedReader {
   document: Document;

   constructor(public reader: LineBufferedReader, public projectionFn: Function) {
      this.document = new Document();
   }

   async read() {
      this.document.types = [];
      if (this.reader.hasMore()) {
         let typefactoryreader = new TypeFactoryBufferedReader(this.reader, this.projectionFn);

         let obj = await typefactoryreader.read();
         if (obj.isValid) {
            this.document.types.push(obj.type);
         }
      }
      return this.document;
   }
}

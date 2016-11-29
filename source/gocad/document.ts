import * as util from "../util/LineReader";
import * as type from "./Type";
import * as factory from "./TypeFactory";

export class Document {
   public types: type.Type[];
   public version: String;
   private reader: util.LineReader;

   constructor(reader: util.LineReader, projectionFn?: Function) {
      this.types = [];
      this.reader = reader;

      if (reader.hasMore()) {
         let obj = new factory.TypeFactory(reader, projectionFn);
         if (obj.isValid) {
            this.types.push(obj.type);
         }
      }
      this.clean();
   }

   clean() {
      this.reader = null;
      if (this.types) {
         this.types.forEach(function (type: type.Type) {
            type.projectionFn = null;
         });
      }
   }
}

import * as type from "./Type";
import * as surface from "./TSurf";
import * as pline from "./PLine";
import * as solid from "./TSolid";
import * as set from "./VSet";
import * as other from "./Unknown";
import * as util from "../util/LineReader";

export class TypeFactory {
   public isValid: boolean = false;
   public type: type.Type;
   public version: String;

   constructor(reader: util.LineReader, projectionFn?: Function) {
      if (reader.hasMore()) {
         let line: string = reader.next().trim();
         let parts: string[] = line.split(/\s+/g);
         this.isValid = parts.length === 3
               && parts[0] === "GOCAD"
               && (parts[2] === "1.0" || parts[2] === "1");

         if (this.isValid) {
            this.version = parts[2];
            if ( parts[1] === "TSurf") {
               this.type = new surface.TSurf(reader, projectionFn);
            } else if (parts[1] === "PLine") {
               this.type = new pline.PLine(reader, projectionFn);
            } else if (parts[1] === "TSolid") {
               this.type = new solid.TSolid(reader, projectionFn);
            } else if (parts[1] === "VSet") {
               this.type = new set.VSet(reader, projectionFn);
            } else {
               this.type = new other.Unknown(reader, projectionFn);
            }
         }
      }
   }
}
import * as type from "./type";
import * as surface from "./tsurf";
import * as pline from "./pline";
import * as solid from "./tsolid";
import * as set from "./vset";
import * as other from "./unknown";
import * as util from "../util/linereader";

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
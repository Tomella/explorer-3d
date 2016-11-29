import * as type from "./Type";
import * as head from "./VSetHeader";
import * as util from "../util/LineReader";
import * as coords from "./CoordinateSystem";

export class VSet extends type.Type {
   public type: string = "VSet";
   public name: string;
   public version: string;
   public vertices: any[] = [];
   public header: head.VSetHeader;

   /**
    * We come in here on the next line
    */
   constructor(reader: util.LineReader, projectionFn?: Function) {
      super(reader, projectionFn);
      let line: string = reader.expects("HEADER");
      if (!line || line.indexOf("{") === -1) {
         return;
      }
      this.header = new head.VSetHeader(reader);
      let cs = new coords.CoordinateSystem(reader);
      let zSign = 1;
      if (cs.isValid) {
         this.coordinateSystem = cs;
         zSign = this.coordinateSystem["ZPOSITIVE"] === "Depth" ? -1 : 1;
      }
      while ((line = reader.nextDataLine().trim()) !== "END") {
         if (line.indexOf("VRTX") === 0 || line.indexOf("PVRTX") === 0) {
            let v = type.vertex(line, projectionFn, zSign);
            this.vertices[v.index] = v.all;
         } else if (line.indexOf("ATOM") === 0 || line.indexOf("PATOM") === 0) {
            let a = type.atom(line);
            this.vertices[a.index] = this.vertices[a.vertexId];
         }
      }
      this.clear();
   }
}
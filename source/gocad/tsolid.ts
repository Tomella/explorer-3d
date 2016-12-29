import * as util from "../util/linereader";
import * as type from "./type";
import * as head from "./header";
import * as coords from "./coordinatesystem";

export class TSolid extends type.Type {
   public type: string = "TSolid";
   public header: head.Header;
   public vertices: any[] = [];
   public tetras: any[] = [];


   constructor(reader: util.LineReader, projectionFn?: Function) {
      super(reader, projectionFn);

      let line: string = reader.expects("HEADER");
      if (!line) {
         return;
      }
      this.header = new head.Header(reader);

      let cs = new coords.CoordinateSystem(reader);
      let zSign = 1;
      if (cs.isValid) {
         this.coordinateSystem = cs;
         zSign = this.coordinateSystem["ZPOSITIVE"] === "Depth" ? -1 : 1;
      }

      line = reader.expects("TVOLUME");
      while ((line = reader.nextDataLine().trim()) !== "END") {
         if (line.indexOf("VRTX") === 0 || line.indexOf("PVRTX") === 0) {
            let v = type.vertex(line, this.projectionFn, zSign);
            this.vertices[v.index] = v.all;
         } else if (line.indexOf("ATOM") === 0 || line.indexOf("PATOM") === 0) {
            let a = type.atom(line);
            this.vertices[a.index] = this.vertices[a.vertexId];
         } else if (line.indexOf("TETRA") === 0) {
            this.tetras.push(tetra(line));
         }
      }
      this.clear();
   }
}

function tetra(tetra: string): number[] {
   let parts = tetra.split(/\s+/g);
   return [
      parseInt(parts[1]),
      parseInt(parts[2]),
      parseInt(parts[3]),
      parseInt(parts[4])
   ];
}

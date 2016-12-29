import * as util from "../util/linereader";
import * as type from "./type";
import * as head from "./header";
import * as coords from "./coordinatesystem";

export class TSurf extends type.Type {
   public type: string = "TSurf";
   public name: string;
   public version: string;
   public vertices: any[] = [];
   public faces: any[] = [];
   public bstones: any[] = [];
   public borders: any[] = [];

   /**
    * We come in here on the next line
    */
   constructor(reader: util.LineReader, projectionFn?: Function) {
      super(reader, projectionFn);
      let line: string = reader.expects("HEADER");
      if (!line || line.indexOf("{") === -1) {
         return;
      }
      this.header = new head.Header(reader);
      // this.dispatchEvent('gocad.header', this.header);

      let cs = new coords.CoordinateSystem(reader);
      let zSign = 1;
      if (cs.isValid) {
         this.coordinateSystem = cs;
         zSign = this.coordinateSystem["ZPOSITIVE"] === "Depth" ? -1 : 1;
      }

      line = reader.expects("TFACE");
      while ((line = reader.nextDataLine().trim()) !== "END") {
         if (line.indexOf("VRTX") === 0 || line.indexOf("PVRTX") === 0) {
            let v = type.vertex(line, this.projectionFn, zSign);
            this.vertices[v.index] = v.all;
         } else if (line.indexOf("ATOM") === 0 || line.indexOf("PATOM") === 0) {
            let a = type.atom(line);
            this.vertices[a.index] = this.vertices[a.vertexId];
         } else if (line.indexOf("TRGL") === 0) {
            this.faces.push(face(line).abc);
         } else if (line.indexOf("BSTONE") === 0) {
            this.bstones.push(bstone(line));
         } else if (line.indexOf("BORDER") === 0) {
            let b = border(line);
            this.borders[b.id] = [b.vertices[0], b.vertices[1]];
         }
      }
      this.clear();
   }
}

function border(border: string) {
   let parts = border.split(/\s+/g);
   return {
      id: +parts[1],
      vertices: [
         +parts[2],
         +parts[3]
      ]
   };
}

function face(face: string) {
   let parts = face.split(/\s+/g);
   let length = parts.length;
   let response: any = {
      get abc() {
         return [this.a, this.b, this.c];
      }
   };

   if (length === 4) {
      response.a = parseInt(parts[1]);
      response.b = parseFloat(parts[2]);
      response.c = parseFloat(parts[3]);
   }
   return response;
}

function bstone(bstone: string) {
   let parts = bstone.split(/\s+/g);
   return parseInt(parts[1]);
}

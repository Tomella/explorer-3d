import * as util from "../util/LineReader";
import * as coords from "./CoordinateSystem";
import * as head from "./PLineHeader";
import * as type from "./Type";
import * as factory from "./TypeFactory";
import * as prop from "./Properties";

export class PLine extends type.Type {
   public type: string = "PLine";
   public name: string;
   public version: string;
   public vertices: any[] = [];
   public lines: any[] = [];
   public header: head.PLineHeader;
   public properties: prop.Properties;

   /**
    * We come in here on the next line
    */
   constructor(reader: util.LineReader, projectionFn?: Function) {
      super(reader, projectionFn);

      let line: string = reader.expects("HEADER");
      if (!line || line.indexOf("{") === -1) {
         return;
      }

      this.header = new head.PLineHeader(reader);
      let cs = new coords.CoordinateSystem(reader);
      let zSign = 1;
      if (cs.isValid) {
         this.coordinateSystem = cs;
         zSign = this.coordinateSystem["ZPOSITIVE"] === "Depth" ? -1 : 1;
      }
      // let props = new Properties(reader);
      // if(props.isValid) {
      //   this.properties = props;
      // }

      line = reader.expects("ILINE");
      let startIndex = 1;
      let lastIndex = 1;
      let hasSeg = false;
      let lineSegments: number[][] = [];
      line = reader.nextDataLine();
      let completed = (line ? line.trim() : "}") === "}";
      while (!completed) {
         if (line.indexOf("VRTX") === 0 || line.indexOf("PVRTX") === 0) {
            let v = type.vertex(line, this.projectionFn, zSign);
            this.vertices[v.index] = v.all;
            lastIndex = v.index;
         } else if (line.indexOf("ATOM") === 0 || line.indexOf("PATOM") === 0) {
            let a = type.atom(line);
            this.vertices[a.index] = this.vertices[a.vertexId];
         } else if (line.indexOf("SEG") === 0) {
            lineSegments.push(segment(line));
            hasSeg = true;
         } else if (line.indexOf("ILINE") === 0 || line.indexOf("END") === 0) {
            completed = line.indexOf("END") === 0;
            if (!hasSeg && lastIndex > startIndex) {
               // We have to step over every vertex pair from start index to lastIndex
               for (let i = startIndex; i < lastIndex; i++) {
                  lineSegments.push([i, i + 1]);
               }
            }
            this.lines.push(lineSegments);
            lineSegments = [];
            startIndex = lastIndex + 1;
            hasSeg = false;
         }
         completed = !reader.hasMore();
         if (!completed) {
            completed = (line = reader.nextDataLine().trim()) === "}";
         }
      }
      this.clear();
   }
}

function segment(seg: string): number[] {
   let parts = seg.split(/\s+/g);
   return [
      parseInt(parts[1]),
      parseInt(parts[2])
   ];
}
import { LineBufferedReader } from "../util/linebufferedreader";
import { TSolid } from "../gocad/tsolid";
import { atom } from "../gocad/atom";
import { tetra } from "../gocad/tetra";
import { vertex } from "../gocad/vertex";
import { TypeBufferedReader } from "./typebufferedreader";
import { HeaderBufferedReader } from "./headerbufferedreader";
import { CoordinateSystemBufferedReader } from "./coordinatesystembufferedreader";

export class TSolidBufferedReader {

   constructor(public reader: LineBufferedReader, public projectionFn?: Function) {
   }

   async read(): Promise<TSolid> {
      let tsolid = new TSolid();
      let type = await new TypeBufferedReader(this.reader, this.projectionFn).read();

      let line: string = await this.reader.expects("HEADER");
      if (line) {
         tsolid.header = await new HeaderBufferedReader(this.reader).read();

         let cs = await new CoordinateSystemBufferedReader(this.reader).read();

         let zSign = 1;
         if (cs.isValid) {
            tsolid.coordinateSystem = cs;
            zSign = tsolid.coordinateSystem["ZPOSITIVE"] === "Depth" ? -1 : 1;
         }

         line = await this.reader.expects("TVOLUME");
         while ((line = (await this.reader.nextDataLine()).trim()) !== "END") {
            if (line.indexOf("VRTX") === 0 || line.indexOf("PVRTX") === 0) {
               let v = vertex(line, this.projectionFn, zSign);
               tsolid.vertices[v.index] = v.all;
            } else if (line.indexOf("ATOM") === 0 || line.indexOf("PATOM") === 0) {
               let a = atom(line);
               tsolid.vertices[a.index] = tsolid.vertices[a.vertexId];
            } else if (line.indexOf("TETRA") === 0) {
               tsolid.tetras.push(tetra(line));
            }
         }
      }
      return tsolid;
   }
}

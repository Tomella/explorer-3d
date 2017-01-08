import { atom } from "../gocad/atom";
import { vertex } from "../gocad/vertex";
import { VSet } from "../gocad/vset";
import { VSetHeaderBufferedReader } from "./vsetheaderbufferedreader";
import { LineBufferedReader } from "../util/linebufferedreader";
import { CoordinateSystemBufferedReader } from "./coordinatesystembufferedreader";

export class VSetBufferedReader {

   /**
    * We come in here on the next line
    */
   constructor(public reader: LineBufferedReader, public projectionFn?: Function) {
   }

   async read(): Promise<VSet> {
      let vset = new VSet();
      let line: string = await this.reader.expects("HEADER");
      if (!line || line.indexOf("{") === -1) {
         return;
      }

      vset.header = await new VSetHeaderBufferedReader(this.reader).read();
      let cs = await new CoordinateSystemBufferedReader(this.reader).read();
      let zSign = 1;
      if (cs.isValid) {
         vset.coordinateSystem = cs;
         zSign = vset.coordinateSystem["ZPOSITIVE"] === "Depth" ? -1 : 1;
      }
      while ((line = (await this.reader.nextDataLine()).trim()) !== "END") {
         if (line.indexOf("VRTX") === 0 || line.indexOf("PVRTX") === 0) {
            let v = vertex(line, this.projectionFn, zSign);
            vset.vertices[v.index] = v.all;
         } else if (line.indexOf("ATOM") === 0 || line.indexOf("PATOM") === 0) {
            let a = atom(line);
            vset.vertices[a.index] = vset.vertices[a.vertexId];
         }
      }

      return vset;
   }
}
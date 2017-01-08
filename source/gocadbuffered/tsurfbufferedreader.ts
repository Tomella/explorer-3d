import { atom } from "../gocad/atom";
import { border } from "../gocad/border";
import { bstone } from "../gocad/bstone";
import { face } from "../gocad/face";
import { vertex } from "../gocad/vertex";

import { LineBufferedReader } from "../util/linebufferedreader";
import { TSurf } from "../gocad/tsurf";
import { CoordinateSystemBufferedReader } from "./coordinatesystembufferedreader";
import { HeaderBufferedReader } from "./headerbufferedreader";
import { TypeBufferedReader } from "./typebufferedreader";
import { Header }from "../gocad/header";

export class TSurfBufferedReader extends TypeBufferedReader {
   /**
    * We come in here on the next line
    */
   constructor(reader: LineBufferedReader, projectionFn?: Function) {
      super(reader, projectionFn);
   }

   async read(): Promise<TSurf> {
      let tsurf = new TSurf();
      let line: string = await this.reader.expects("HEADER");
      if (!line || line.indexOf("{") === -1) {
         return tsurf;
      }

      tsurf.header = await new HeaderBufferedReader(this.reader).read();
      // this.dispatchEvent('gocad.header', this.header);

      let cs = await new CoordinateSystemBufferedReader(this.reader).read();
      let zSign = 1;
      if (cs.isValid) {
         tsurf.coordinateSystem = cs;
         zSign = tsurf.coordinateSystem["ZPOSITIVE"] === "Depth" ? -1 : 1;
      }

      line = await this.reader.expects("TFACE");
      while ((line = (await this.reader.nextDataLine()).trim()) !== "END") {
         if (line.indexOf("VRTX") === 0 || line.indexOf("PVRTX") === 0) {
            let v = vertex(line, this.projectionFn, zSign);
            tsurf.vertices[v.index] = v.all;
         } else if (line.indexOf("ATOM") === 0 || line.indexOf("PATOM") === 0) {
            let a = atom(line);
            tsurf.vertices[a.index] = tsurf.vertices[a.vertexId];
         } else if (line.indexOf("TRGL") === 0) {
            tsurf.faces.push(face(line).abc);
         } else if (line.indexOf("BSTONE") === 0) {
            tsurf.bstones.push(bstone(line));
         } else if (line.indexOf("BORDER") === 0) {
            let b = border(line);
            tsurf.borders[b.id] = [b.vertices[0], b.vertices[1]];
         }
      }
      return tsurf;
   }
}

import { CoordinateSystem } from "../gocad/coordinatesystem";
import * as util from "../util/linebufferedreader";

export class CoordinateSystemBufferedReader {

   constructor(public reader: util.LineBufferedReader) {
   }

   async read(): Promise<CoordinateSystem> {
      let coordinateSystem = new CoordinateSystem();
      let line = (await this.reader.nextDataLine()).trim();
      if (line !== "GOCAD_ORIGINAL_COORDINATE_SYSTEM") {
         this.reader.previous();
         coordinateSystem.isValid = false || true;
      } else {
         line = (await this.reader.nextDataLine()).trim();
         while (line && line !== "END_ORIGINAL_COORDINATE_SYSTEM") {
            let index = line.indexOf(" ");
            if (index > 0) {
               let name = line.substring(0, index);
               let rest = line.substring(index).trim();
               let mapper: Function = coordinateSystem.typeMap[name] ? coordinateSystem.typeMap[name] : function (val: string) { return val; };
               coordinateSystem[name] = mapper(rest);
            }
            line = (await this.reader.nextDataLine()).trim();
         }
      }
      coordinateSystem.typeMap = null;
      return coordinateSystem;
   }
}
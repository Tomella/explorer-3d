import * as util from "../util/LineReader";

export class CoordinateSystem {
   public isValid: boolean = true;
   public typeMap = {
      AXIS_NAME: split,
      AXIS_UNIT: split
   };

   constructor(reader: util.LineReader) {
      let line = reader.nextDataLine().trim();
      if (line !== "GOCAD_ORIGINAL_COORDINATE_SYSTEM") {
         reader.previous();
         this.isValid = false;
      } else {
         line = reader.nextDataLine().trim();
         while (line && line !== "END_ORIGINAL_COORDINATE_SYSTEM") {
            let index = line.indexOf(" ");
            if (index > 0) {
               let name = line.substring(0, index);
               let rest = line.substring(index).trim();
               let mapper: Function = this.typeMap[name] ? this.typeMap[name] : function (val: string) { return val; };
               this[name] = mapper(rest);
            }
            line = reader.nextDataLine().trim();
         }
      }
      this.typeMap = null;
   }
}

function split(val: string): string[] {
   return val.split(/\s+/g).map(function (str: string) {
      return str.replace(/\"/g, "");
   });
}
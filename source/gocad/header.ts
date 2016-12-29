import * as util from "../util/linereader";

export class Header {
   public values: any = {};
   public typeMap = {
      ivolmap: toBool,
      imap: toBool,
      parts: toBool,
      mesh: toBool,
      cn: toBool,
      border: toBool,
      "*solid*color": toColor
   };

   public name: string;
   public solidColor: number;

   constructor(reader: util.LineReader) {
      let line = reader.nextDataLine().trim();
      while (line) {
         if (line.indexOf("}") === 0) {
            break;
         }
         let parts = line.split(":");
         if (parts.length === 2) {
            let mapper = this.typeMap[parts[0]];
            mapper = mapper ? mapper : flowThru;
            this.values[parts[0]] = mapper(parts[1]);
         } else {
            console.warn("That doesn't look like a pair: " + line);
         }
         line = reader.nextDataLine().trim();
      }

      this.name = this.values["name"];
      this.solidColor = this.values["*solid*color"];
      this.solidColor = this.solidColor ? this.solidColor : 0xeeeeee;
      this.typeMap = null;
   }

   toColor(key: string): number {
      return toColor(key);
   }

   toBool(val: string): boolean {
      return toBool(val);
   }
}

export function toBool(val: string): boolean {
   return "true" === val;
}

export function flowThru(val: string) {
   return val;
}

export function toColor(val: string): number {
   if (val) {
      let parts = val.trim().split(/\s+/g);
      if (parts.length === 1) {
         if (parts[0].indexOf("#") === 0) {
            return parseInt("0x" + parts[0].substring(1));
         }
      }
      return parseFloat(parts[0]) * 255 * 256 * 256 + parseFloat(parts[1]) * 255 * 256 + parseFloat(parts[2]) * 255;
   }
   return null;
}
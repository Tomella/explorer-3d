import * as util from "../util/LineReader";

export class Properties {
   public isValid: boolean = true;
   public names: any = {};
   public range: any = {
      min: null,
      max: null
   };
   private terminator: string = "}";

   constructor(reader: util.LineReader, terminators?: string[]) {
      terminators = terminators ? terminators : [];
      terminators.push(this.terminator);

      let line = reader.nextDataLine().trim();
      this.isValid = false;
      if (line.indexOf("PROPERTIES") !== 0) {
         reader.previous();
      } else {
         let self = this;
         let keys = getValues(line);
         if (keys.length) {
            keys.forEach((key: string) => {
               this.names[key] = {};
            });
         }

         this.isValid = true;
         line = reader.nextDataLine().trim();
         while (true) {
            let values = getValues(line);
            if (line.indexOf("PROP_LEGAL_RANGES") === 0 && values.length === 2) {
               if (values[0] !== "**none**") {
                  this.range.min = parseFloat(values[0]);
               }
               if (values[1] !== "**none**") {
                  this.range.min = parseFloat(values[1]);
               }
            } else if (line.indexOf("PROPERTY_CLASSES") === 0 && values.length > 0) {
               values.forEach((value, index) => {
                  this.names[keys[index]].className = value;
               });
            } else if (line.indexOf("UNITS") === 0 && values.length > 0) {
               values.forEach((value, index) => {
                  this.names[keys[index]].unit = value;
               });
            }
            line = reader.nextDataLine() ? line.trim() : "}";
            if (line.indexOf("}") === 0) {
               break;
            }
         }
      }
      // console.log(this);
   }

}

function getValues(line: string): string[] {
   let parts = line.split(/\s+/g);
   parts.shift();
   return parts;
}
import { LineBufferedReader } from "../util/linebufferedreader";
import { Properties } from "../gocad/properties";

export class PropertiesBufferedReader {
   public isValid: boolean = true;
   public names: any = {};
   public range: any = {
      min: null,
      max: null
   };
   private terminator: string = "}";

   constructor(public reader: LineBufferedReader, public terminators: string[] = []) {
      terminators.push(this.terminator);
   }

   async read(): Promise<Properties> {

      let properties = new Properties();
      let line = (await this.reader.nextDataLine()).trim();

      properties.isValid = false;
      if (line.indexOf("PROPERTIES") !== 0) {
         this.reader.previous();
      } else {
         let keys = getValues(line);
         if (keys.length) {
            keys.forEach((key: string) => {
               properties.names[key] = {};
            });
         }

         properties.isValid = true;
         line = (await this.reader.nextDataLine()).trim();
         while (true) {
            let values = getValues(line);
            if (line.indexOf("PROP_LEGAL_RANGES") === 0 && values.length === 2) {
               if (values[0] !== "**none**") {
                  properties.range.min = parseFloat(values[0]);
               }
               if (values[1] !== "**none**") {
                  properties.range.min = parseFloat(values[1]);
               }
            } else if (line.indexOf("PROPERTY_CLASSES") === 0 && values.length > 0) {
               values.forEach((value, index) => {
                  properties.names[keys[index]].className = value;
               });
            } else if (line.indexOf("UNITS") === 0 && values.length > 0) {
               values.forEach((value, index) => {
                  properties.names[keys[index]].unit = value;
               });
            }
            line = (await this.reader.nextDataLine());
            line = line ? line.trim() : "}";
            if (line.indexOf("}") === 0) {
               break;
            }
         }
      }

      return properties;
   }
}

function getValues(line: string): string[] {
   let parts = line.split(/\s+/g);
   parts.shift();
   return parts;
}
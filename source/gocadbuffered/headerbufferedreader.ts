import { flowThru } from "../util/flowthru";
import { LineBufferedReader } from "../util/linebufferedreader";
import { Header } from "../gocad/header";

export class HeaderBufferedReader {
   constructor(public reader: LineBufferedReader) {
   }

   async read(): Promise<Header> {
      let header = new Header();
      let line = (await this.reader.nextDataLine()).trim();
      while (line) {
         if (line.indexOf("}") === 0) {
            break;
         }
         let parts = line.split(":");
         if (parts.length === 2) {
            let mapper = header.typeMap[parts[0]];
            mapper = mapper ? mapper : flowThru;
            header.values[parts[0]] = mapper(parts[1]);
         } else {
            console.warn("That doesn't look like a pair: " + line);
         }
         line = (await this.reader.nextDataLine()).trim();
      }

      header.name = header.values["name"];
      header.solidColor = header.values["*solid*color"];
      header.solidColor = header.solidColor ? header.solidColor : 0xeeeeee;
      header.typeMap = null;
      return header;
   }
}

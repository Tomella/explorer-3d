import { flowThru } from "../util/flowthru";
import { isDataLine } from "../util/linehelper";

import { Logger } from "../util/logger";
import { Pusher } from "./pusher";
import { Header } from "../gocad/header";

export class HeaderPusher extends Pusher<Header> {
   header: Header;

   constructor() {
      super();
      this.header = new Header();
   }

   get obj() {
      return this.header;
   }

   push(line: string): boolean {
      if (!isDataLine(line)) {
         return true;
      }
      line = line.trim();

      if (line.indexOf("}") === 0) {
         this.postLoad();
      } else {
         let parts = line.split(":");
         if (parts.length === 2) {
            let mapper = this.header.typeMap[parts[0]];
            mapper = mapper ? mapper : flowThru;
            this.header.values[parts[0]] = mapper(parts[1]);
         } else {
            Logger.warn("That doesn't look like a pair: " + line);
         }
      }
         return true;
   }

   private postLoad() {
      this.complete = true;

      let header = this.header;
      header.name = header.values["name"];
      header.solidColor = header.values["*solid*color"];
      header.solidColor = header.solidColor ? header.solidColor : 0xeeeeee;
      header.typeMap = null;
   }
}

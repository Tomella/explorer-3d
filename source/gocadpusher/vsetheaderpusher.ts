import { toColor } from "../util/tocolor";
import { Header } from "../gocad/header";
import { VSetHeader } from "../gocad/vsetheader";
import { HeaderPusher } from "./headerpusher";
import * as util from "../util/linereader";

export class VSetHeaderPusher  extends HeaderPusher {
   public vsetHeader: VSetHeader;

   constructor() {
      super();
   }

   get obj(): VSetHeader {
      return this.vsetHeader;
   }

   push(line: string): boolean {
      let accepted = super.push(line);

      if (this.complete) {
         this.complete = true;
         this.vsetHeader = Object.assign(new VSetHeader(), this.header);
         this.vsetHeader.color = toColor(<string>this.vsetHeader.values["*atoms*color"]);
      }
      return accepted;
   }
}

import { toColor } from "../util/tocolor";
import { Pusher } from "./pusher";
import { HeaderPusher } from "./headerpusher";
import { Header } from "../gocad/header";
import { PLineHeader } from "../gocad/plineheader";

export class PLineHeaderPusher extends HeaderPusher {

   public plineHeader: PLineHeader;
   public color: number;

   constructor() {
      super();
   }

   get obj(): PLineHeader {
      return this.plineHeader;
   }

   push(line: string): boolean {
      let accepted = super.push(line);

      if (this.complete) {
         this.complete = true;
         this.plineHeader = Object.assign(new PLineHeader(), this.header);
         this.plineHeader.typeMap = null;
         this.plineHeader.paintedVariable = this.plineHeader.values["*painted*variable"];
         let color = this.plineHeader.values["*line*color"];
         this.plineHeader.color = color ? toColor(color) : 0x0000ff;
      }
      return accepted;
   }
}

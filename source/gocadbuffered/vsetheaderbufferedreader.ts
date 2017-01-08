import { toColor } from "../util/tocolor";
import { Header } from "../gocad/header";
import { VSetHeader } from "../gocad/vsetheader";
import { HeaderBufferedReader } from "./headerbufferedreader";
import { LineBufferedReader } from "../util/linebufferedreader";

export class VSetHeaderBufferedReader {
   public color: number;

   constructor(public reader: LineBufferedReader) {
   }

   async read(): Promise<VSetHeader> {
      let header = await new HeaderBufferedReader(this.reader).read();

      let vsetheader = Object.assign(new VSetHeader(), header);
      vsetheader.color = toColor(<string>vsetheader.values["*atoms*color"]);

      return vsetheader;
   }
}

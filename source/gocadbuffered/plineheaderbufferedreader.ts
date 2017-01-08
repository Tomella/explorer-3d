import { toColor } from "../util/tocolor";
import { LineBufferedReader } from "../util/linebufferedreader";
import { HeaderBufferedReader } from "./headerbufferedreader";
import { Header } from "../gocad/header";
import { PLineHeader } from "../gocad/plineheader";

export class PLineHeaderBufferedReader extends HeaderBufferedReader {

   public paintedVariable: boolean;
   public color: number;

   constructor(reader: LineBufferedReader) {
      super(reader);
   }

   async read(): Promise<PLineHeader> {
      let header = await super.read();

      let plineHeader = Object.assign(new PLineHeader(), header);
      plineHeader.paintedVariable = plineHeader.values["*painted*variable"];
      let color = plineHeader.values["*line*color"];
      plineHeader.color = color ? toColor(color) : 0x0000ff;
      return plineHeader;
   }
}
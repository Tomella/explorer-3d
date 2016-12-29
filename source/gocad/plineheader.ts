import * as util from "../util/linereader";
import * as head from "./header";

export class PLineHeader extends head.Header {

   public paintedVariable: boolean;
   public color: number;

   constructor(reader: util.LineReader) {
      super(reader);
      this.paintedVariable = this.values["*painted*variable"];
      let color = this.values["*line*color"];
      this.color = color ? this.toColor(color) : 0x0000ff;
   }
}
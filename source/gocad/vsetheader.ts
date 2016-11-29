import * as head from "./Header";
import * as util from "../util/LineReader";

export class VSetHeader extends head.Header {
   public color: number;

   constructor(reader: util.LineReader) {
      super(reader);
      this.color = this.toColor(<string>this.values["*atoms*color"]);
   }
}

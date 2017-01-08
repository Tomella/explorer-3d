import { toBool } from "../util/tobool";
import { toColor } from "../util/tocolor";

export class Header {
   public values: any = {};
   public typeMap = {
      ivolmap: toBool,
      imap: toBool,
      parts: toBool,
      mesh: toBool,
      cn: toBool,
      border: toBool,
      "*solid*color": toColor
   };

   public name: string;
   public solidColor: number;
}

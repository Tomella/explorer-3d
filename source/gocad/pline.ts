import { PLineHeader } from "./plineheader";
import { Type } from "./type";
import { Box } from "./box";
import { Properties } from "./properties";

export class PLine extends Type {
   public type: string = "PLine";
   public vertices: any[] = [];
   public lines: any[] = [];
   public header: PLineHeader;
   public properties: Properties;
   public bbox: Box;
}

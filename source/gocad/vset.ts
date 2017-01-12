import { Box } from "./box";
import { Type } from "./type";
import { VSetHeader } from "./vsetheader";

export class VSet extends Type {
   public type: string = "VSet";
   public vertices: any[] = [];
   public header: VSetHeader;
   public bbox: Box;
}
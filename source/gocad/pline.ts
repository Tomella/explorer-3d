import { PLineHeader } from "./plineheader";
import { Type } from "./type";
import { Properties } from "./properties";

export class PLine extends Type {
   public type: string = "PLine";
   public name: string;
   public version: string;
   public vertices: any[] = [];
   public lines: any[] = [];
   public header: PLineHeader;
   public properties: Properties;
}

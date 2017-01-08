import { Type } from "./type";
import { VSetHeader } from "./vsetheader";

export class VSet extends Type {
   public type: string = "VSet";
   public name: string;
   public version: string;
   public vertices: any[] = [];
   public header: VSetHeader;
}
import { Type } from "./type";
import { Header } from "./header";

export class TSolid extends Type {
   public type: string = "TSolid";
   public header: Header;
   public vertices: any[] = [];
   public tetras: any[] = [];
}

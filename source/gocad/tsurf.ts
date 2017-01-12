import { Type } from "./type";
import { Box } from "./box";

export class TSurf extends Type {
   public type: string = "TSurf";
   public vertices: number[][] = [];
   public faces: any[] = [];
   public bstones: any[] = [];
   public borders: any[] = [];
   public bbox: Box;
}

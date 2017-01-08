import { Type } from "./type";

export class TSurf extends Type {
   public type: string = "TSurf";
   public name: string;
   public version: string;
   public vertices: number[][] = [];
   public faces: any[] = [];
   public bstones: any[] = [];
   public borders: any[] = [];
}

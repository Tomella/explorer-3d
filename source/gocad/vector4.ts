import { Vector3 } from "./vector3";

export class Vector4 extends Vector3 {
   constructor(x: number, y: number, z: number, public w: number) {
      super(x, y, z);
   }
}
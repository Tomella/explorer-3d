import { Vector3 } from "../gocad/vector3";

export class VectorFactory {
   static subVectors(a: number[], b: number[] ) {
      return new Vector3(
         a[0] - b[0],
         a[1] - b[1],
         a[2] - b[2]
      );
   }

   static cross(v: Vector3, w: Vector3) {
      let vx = v.x, vy = v.y, vz = v.z;
      let wx = w.x, wy = w.y, wz = w.z;

      let x = vy * wz - vz * wy;
      let y = vz * wx - vx * wz;
      let z = vx * wy - vy * wx;

      return new Vector3(x, y, z);
   }

   static normalize(v: Vector3) {
      return VectorFactory.divideScalar(v, VectorFactory.calcLength(v) );
   }

   static calcLength(v: Vector3) {
      return Math.sqrt( v.x * v.x + v.y * v.y + v.z * v.z );
   }

   static divideScalar(v: Vector3, scalar: number) {
      return VectorFactory.multiplyScalar(v, 1 / scalar);
   }

   static multiplyScalar(v: Vector3, scalar: number) {
      if ( isFinite( scalar ) ) {
         v.x *= scalar;
         v.y *= scalar;
         v.z *= scalar;
      } else {
         v.x = 0;
         v.y = 0;
         v.z = 0;
      }
      return v;
   }
}
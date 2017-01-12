import { VectorFactory } from "./vectorfactory";

export class FaceFactory {
   static computeNormal(face: any[], vertices: number[][]) {
      let a = vertices[face[0]];
      let b = vertices[face[1]];
      let c = vertices[face[2]];

      let cb = VectorFactory.subVectors( c, b );
      let ab = VectorFactory.subVectors( a, b );
      cb = VectorFactory.cross(cb, ab);
      VectorFactory.normalize(cb);
      face[3] = cb ;
   }
}
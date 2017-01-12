import { Box } from "../gocad/box";
import { Vector3 } from "../gocad/vector3";

export class BoxFactory {
   static fromVertices(vertices: number[][] = []): Box {
      let box;
      vertices.forEach(vertex => {
         box = BoxFactory.expand(box, vertex);
      });
      return box;
   }

   static expand(box: Box = new Box(new Vector3(Infinity, Infinity, Infinity), new Vector3(-Infinity, -Infinity, -Infinity)), vertex: number[]) {
      box.min.x = Math.min(box.min.x, vertex[0]);
      box.min.y = Math.min(box.min.y, vertex[1]);
      box.min.z = Math.min(box.min.z, vertex[2]);
      box.max.x = Math.max(box.max.x, vertex[0]);
      box.max.y = Math.max(box.max.y, vertex[1]);
      box.max.z = Math.max(box.max.z, vertex[2]);
      return box;
   }

   static toThreeBox3(box: Box) {
      return new THREE.Box3(
         new THREE.Vector3(box.min.x, box.min.y, box.min.z),
         new THREE.Vector3(box.max.x, box.max.y, box.max.z)
      );
   }
}
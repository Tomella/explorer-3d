import { TSurf } from "../libs";

export function loadBstones(tsurf: TSurf): THREE.Object3D {
   let geometry = new THREE.Geometry();

   tsurf.bstones.forEach(function (bstone: any) {
      let xyz = tsurf.vertices[bstone];
      if (xyz) {
         let vertex = new THREE.Vector3(xyz[0], xyz[1], xyz[2]);
         geometry.vertices.push(vertex);
      }
   });

   if (geometry.vertices.length) {
      geometry.computeBoundingBox();
      let material = new THREE.PointsMaterial({ size: 4096 * 4 });
      return new THREE.Points(geometry, material);
   }
   return null;
}

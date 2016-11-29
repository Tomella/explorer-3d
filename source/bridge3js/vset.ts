import { VSet } from "../libs";

export function loadVSet(vset: VSet): THREE.Points {
   let geometry = new THREE.Geometry();
   let color = vset.header.color;

   vset.vertices.forEach((vertex: number[]) => {
      let v = new THREE.Vector3(vertex[0], vertex[1], vertex[2]);
      geometry.vertices.push(v);
   });

   let material = new THREE.PointsMaterial({ size: 16, color: color });
   let particles = new THREE.Points(geometry, material);

   geometry.computeBoundingBox();
   geometry.computeBoundingSphere();
   geometry.computeFaceNormals();

   return particles;
}
import { TSurf } from "../libs";

export function loadTSurf(tsurf: TSurf): THREE.Object3D {
   let geometry = new THREE.Geometry();
   let color = tsurf.header.solidColor;
   let mat = new THREE.MeshLambertMaterial({
      color: color ? color : 0xff1111,
      side: THREE.DoubleSide
   });

   tsurf.vertices.forEach((vertex: number[]) => {
      geometry.vertices.push(new THREE.Vector3(vertex[0], vertex[1], vertex[2]));
   });

   tsurf.faces.forEach((face: number[]) => {
      // GOCAD indexes with a base of 1. Normalize.
      geometry.faces.push(new THREE.Face3(face[0] - 1, face[1] - 1, face[2] - 1));
   });
   geometry.computeBoundingBox();
   geometry.computeFaceNormals();
   let mesh = new THREE.Mesh(geometry, mat);

   return mesh;
}
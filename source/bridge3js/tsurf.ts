import { TSurf } from "../gocad/tsurf";

export function loadTSurf(tsurf: TSurf): THREE.Object3D {
   let geometry = new THREE.Geometry();
   let color = tsurf.header.solidColor;
   let mat = new THREE.MeshLambertMaterial({
      color: color ? color : 0xff1111,
      side: THREE.DoubleSide
   });

   geometry.vertices = tsurf.vertices.map(vertex => new THREE.Vector3(vertex[0], vertex[1], vertex[2]));
   geometry.faces = tsurf.faces.map(face => new THREE.Face3(face[0], face[1], face[2]));

   geometry.computeBoundingBox();
   geometry.computeFaceNormals();
   let mesh = new THREE.Mesh(geometry, mat);

   return mesh;
}
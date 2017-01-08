import { TSurf } from "../gocad/tsurf";

export function loadBorders(tsurf: TSurf): THREE.Object3D {
   let segments = new THREE.Geometry();

   tsurf.borders.forEach(function (seg: any) {
      let vertex = tsurf.vertices[seg[0]];
      segments.vertices.push(new THREE.Vector3(vertex[0], vertex[1], vertex[2]));

      vertex = tsurf.vertices[seg[1]];
      segments.vertices.push(new THREE.Vector3(vertex[0], vertex[1], vertex[2]));
   });

   if (segments.vertices.length) {
      segments.computeBoundingBox();
      return new THREE.LineSegments(segments, new THREE.LineBasicMaterial({
         linewidth: 10,
         color: 0xff00ff
      }));
   }
   return null;
}
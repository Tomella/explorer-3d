import { PLine, range } from "../libs";

export function loadPLine(pline: PLine): THREE.Object3D {
   let minMax: number[] = range(pline.vertices, function (a: any[]) {
      return a ? +a[3] : null;
   });

   let material = new THREE.LineBasicMaterial({
      linewidth: 10,
      color: 0xffffff, // pline.header.color,
      vertexColors: THREE.VertexColors
   });

   let geometry = new THREE.Geometry();
   let lut = new THREE.Lut("rainbow", Math.floor(minMax[1] - minMax[0]));

   lut.setMax(Math.floor(minMax[1]));
   lut.setMin(Math.floor(minMax[0]));

   pline.lines.forEach((line: number[][]) => {
      line.forEach((seg: number[], index: number) => {
         let vertex = pline.vertices[seg[0]];
         geometry.vertices.push(new THREE.Vector3(vertex[0], vertex[1], vertex[2]));
         geometry.colors.push(lut.getColor(parseInt(vertex[3])));

         vertex = pline.vertices[seg[1]];
         geometry.vertices.push(new THREE.Vector3(vertex[0], vertex[1], vertex[2]));
         geometry.colors.push(lut.getColor(parseInt(vertex[3])));
      });
   });

   geometry.computeBoundingBox();
   geometry.computeBoundingSphere();
   return new THREE.LineSegments(geometry, material);
}
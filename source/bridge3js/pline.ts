import { range } from "../util/range";
import { PLine } from "../gocad/pline";

export function loadPLine(pline: PLine): THREE.Object3D {
   let minMax: number[] = range(pline.vertices, function (a: any[]) {
      return a ? +a[3] : null;
   });

   let solidColor = pline.header.color;
   let material = new THREE.LineBasicMaterial({
      linewidth: 10,
      color: solidColor ? solidColor : 0xffffff, // pline.header.color,
      vertexColors: THREE.VertexColors
   });

   let geometry = new THREE.Geometry();
   let lut = new THREE.Lut("rainbow", Math.floor(minMax[1] - minMax[0]));

   lut.setMax(Math.floor(minMax[1]));
   lut.setMin(Math.floor(minMax[0]));

   pline.lines.forEach((line: number[][]) => {
      line.forEach((seg: number[], index: number) => {
         let vertex = pline.vertices[seg[0]];
         let color = vertex.length > 3 ? lut.getColor(parseInt(vertex[3])) : new THREE.Color(solidColor);
         geometry.vertices.push(new THREE.Vector3(vertex[0], vertex[1], vertex[2]));
         geometry.colors.push(color);

         vertex = pline.vertices[seg[1]];
         color = vertex.length > 3 ? lut.getColor(parseInt(vertex[3])) : new THREE.Color(solidColor);
         geometry.vertices.push(new THREE.Vector3(vertex[0], vertex[1], vertex[2]));
         geometry.colors.push(color);
      });
   });

   geometry.computeBoundingBox();
   geometry.computeBoundingSphere();
   return new THREE.LineSegments(geometry, material);
}

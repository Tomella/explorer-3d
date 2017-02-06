import { Parser } from "../parser/parser";
declare var Elevation: any;

export class WcsElevationPointsParser extends Parser {

   constructor(public options: any = {}) {
      super();
   }

   public parse(): Promise<any> {
      let loader = new Elevation.WcsXyzLoader(this.options);
      return loader.load().then(res => {
         let pointGeo = new THREE.Geometry();
         let rgb = hexToRgb(this.options.color ? this.options.color : "#bbbbff");
         let blue = new THREE.Color().setRGB(rgb.r / 255, rgb.g / 255, rgb.b / 255);
         let lut = new THREE.Lut("land", 2200);

         lut.setMax(Math.floor(2200));
         lut.setMin(Math.floor(0));
         res.forEach((point, i) => {
            let x = point.x;
            let y = point.y;
            let z = point.z;
            let p = new THREE.Vector3(x, y, z);
            pointGeo.vertices.push(p);
            pointGeo.colors.push(z > 0 ? lut.getColor(z) : blue);
         });
         if (res.length) {
            pointGeo.computeBoundingSphere();
            if (pointGeo.boundingSphere.radius < 5) {
               console.log("Overriding bounding sphere radius" + pointGeo.boundingSphere.radius);
               pointGeo.boundingSphere.radius = 5;
            }
         }

         let mat = new THREE.PointsMaterial({
            vertexColors: THREE.VertexColors,
            size: 1
         });

         let points = new THREE.Points(pointGeo, mat);
         points.userData = this.options;
         return points;
      });
   }
}

function hexToRgb(hex) { // TODO rewrite with vector output
   let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
   return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
   } : null;
}
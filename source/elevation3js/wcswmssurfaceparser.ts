import { Parser } from "../parser/parser";
declare var Elevation: any;

export class WcsWmsSurfaceParser extends Parser {

   constructor(public options: any = {}) {
      super();
   }

   public parse(): Promise<any> {
      let loader = new Elevation.WcsXyzLoader(this.options);
      return loader.load().then(res => {
         let resolutionX = this.options.resolutionX;
         let resolutionY = res.length / resolutionX;
         let geometry = new THREE.PlaneGeometry(resolutionX, resolutionY, resolutionX - 1, resolutionY - 1);
         let bbox = this.options.bbox;

         let rgb = hexToRgb(this.options.color ? this.options.color : "#bbbbff");
         let blue = new THREE.Color().setRGB(rgb.r / 255, rgb.g / 255, rgb.b / 255);
         let lut = new THREE.Lut("land", 2200);
         lut.setMax(Math.floor(2200));
         lut.setMin(Math.floor(0));


         geometry.vertices.forEach((vertice, i) => {
            let xyz = res[i];
            let z = res[i].z;
            vertice.z = z;
            vertice.x = xyz.x;
            vertice.y = xyz.y;
         });
         if (res.length) {
            geometry.computeBoundingSphere();
            geometry.computeFaceNormals();
            geometry.computeVertexNormals();
         }

         let loader = new THREE.TextureLoader();
         loader.crossOrigin = "";
         let url = this.options.imageryTemplate
            .replace("${width}", 512)
            .replace("${height}", 512)
            .replace("${bbox}", bbox.join(","));
         let material = new THREE.MeshPhongMaterial({
            map: loader.load(url),
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
         });

         //
         //            {
         //            transparent: true,
         //            opacity: this.options.opacity ? this.options.opacity : 0.6
         //         });

         return new THREE.Mesh(geometry, material);
         /**
                  let mat = new THREE.PointsMaterial({
                     vertexColors: THREE.VertexColors,
                     size: 1
                  });

                  let points = new THREE.Points(pointGeo, mat);
                  points.userData = this.options;
                  return points;
         */
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
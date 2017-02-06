import { Parser } from "../parser/parser";
declare var Elevation: any;

export class WcsCanvasSurfaceParser extends Parser {

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

         let mask = document.createElement("canvas");
         mask.width = resolutionX;
         mask.height = resolutionY;
         let context = mask.getContext("2d");
         let id = context.createImageData(1, 1);
         let d  = id.data;

         // TODO: Some magic numbers. I need think about them. I think the gradient should stay the same.
         let blue = new THREE.Lut("water", 5000);
         let lut  = new THREE.Lut("land", 2200);
         blue.setMax(0);
         blue.setMin(-5000);
         lut.setMax(Math.floor(2200));
         lut.setMin(Math.floor(0));

         geometry.vertices.forEach((vertice, i) => {
            let xyz = res[i];
            let z = res[i].z;
            vertice.z = z;
            vertice.x = xyz.x;
            vertice.y = xyz.y;

            if (z > 0) {
               let color = lut.getColor(z);
               drawPixel(i % resolutionX, Math.floor(i / resolutionX), color.r * 255, color.g * 255, color.b * 255, 255);
            } else {
               let color = blue.getColor(z);
               drawPixel(i % resolutionX, Math.floor(i / resolutionX), color.r * 255, color.g * 255, color.b * 255, 255);
            }
         });

         if (res.length) {
            geometry.computeBoundingSphere();
            geometry.computeFaceNormals();
            geometry.computeVertexNormals();
         }

         let texture = new THREE.Texture(mask);
         texture.needsUpdate = true;
         let material = new THREE.MeshPhongMaterial({
            map: texture,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
         });
         let mesh = new THREE.Mesh(geometry, material);

         mesh.userData = this.options;
         return mesh;

         function drawPixel(x, y, r, g, b, a) {
            d[0]   = r;
            d[1]   = g;
            d[2]   = b;
            d[3]   = a;
            context.putImageData( id, x, y );
         }
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
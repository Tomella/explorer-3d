import { Parser } from "../parser/parser";
import { WmsMaterial } from "../material/wmsmaterial";

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

         let material = new WmsMaterial({
            width: this.options.imageWidth,
            height: this.options.imageHeight,
            opacity: this.options.opacity,
            template: this.options.imageryTemplate,
            bbox
         });
         let mesh = new THREE.Mesh(geometry, material);
         mesh.userData = this.options;
         return mesh;
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
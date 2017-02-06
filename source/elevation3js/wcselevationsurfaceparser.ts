import { Parser } from "../parser/parser";
declare var Elevation: any;

export class WcsElevationSurfaceParser extends Parser {

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

         let material = new THREE.MeshPhongMaterial({ color: 0x0033ff, specular: 0x555555, shininess: 30 });
         return new THREE.Mesh(geometry, material);
      });
   }
}

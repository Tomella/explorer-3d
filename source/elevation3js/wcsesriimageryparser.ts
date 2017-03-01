import { EsriImageryLoader } from "../imagery/esriimagerloader";
import { Parser } from "../parser/parser";
import { Event } from "../domain/event";

declare var Elevation: any;

export class WcsEsriImageryParser extends Parser {
   static BBOX_CHANGED_EVENT = "bbox.change";

   constructor(public options: any = {}) {
      super();
   }

   public parse(): Promise<any> {
      let options = Object.assign({}, this.options, { resolutionX: this.options.imageWidth, resolutionY: this.options.imageHeight });

      return new EsriImageryLoader(options).load().then(esriData => {
         // Get the extent returned by ESRI
         let extent = esriData.extent;
         let bbox = [
            extent.xmin,
            extent.ymin,
            extent.xmax,
            extent.ymax
         ];

         this.dispatchEvent(new Event(WcsEsriImageryParser.BBOX_CHANGED_EVENT, {
            bbox,
            aspectRatio: esriData.width / esriData.height
         }));

         // Merge the options
         let options = Object.assign({}, this.options, { bbox });

         let restLoader = new Elevation.WcsXyzLoader(options);

         return restLoader.load().then(res => {
            let resolutionX = this.options.resolutionX;
            let resolutionY = res.length / resolutionX;
            let geometry = new THREE.PlaneGeometry(resolutionX, resolutionY, resolutionX - 1, resolutionY - 1);
            let bbox = this.options.bbox;

            geometry.vertices.forEach((vertice, i) => {
               let xyz = res[i];
               vertice.z = xyz.z;
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
            let url = esriData.href;

            let opacity = this.options.opacity ? this.options.opacity : 1;
            let material = new THREE.MeshPhongMaterial({
               map: loader.load(url),
               transparent: true,
               opacity: opacity,
               side: THREE.DoubleSide
            });
            let mesh = new THREE.Mesh(geometry, material);

            mesh.userData = this.options;
            return mesh;
         });
      });
   }
}
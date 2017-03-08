import { EsriImageryLoader } from "../imagery/esriimagerloader";
import { Parser } from "../parser/parser";
import { Event } from "../domain/event";

export class WcsEsriImageryParser extends Parser {
   static BBOX_CHANGED_EVENT = "bbox.change";
   static TEXTURE_LOADED_EVENT = "texture.loaded";

   constructor(public options: any = {}) {
      super();
   }

   private loadImage(url: any, bbox: number[]) {
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

         let opacity = this.options.opacity ? this.options.opacity : 1;
         let material = new THREE.MeshPhongMaterial({
            map: loader.load(url, event => {
               this.dispatchEvent(new Event(WcsEsriImageryParser.TEXTURE_LOADED_EVENT, mesh));
            }),
            transparent: true,
            opacity: opacity,
            side: THREE.DoubleSide
         });
         let mesh = new THREE.Mesh(geometry, material);

         mesh.userData = this.options;
         return mesh;
      });
   }

   public parse(): Promise<any> {
      let options = Object.assign({}, this.options, { resolutionX: this.options.imageWidth, resolutionY: this.options.imageHeight });
      if (this.options.imageOnly) {
         let url = this.options.esriTemplate
            .replace("${bbox}", this.options.bbox)
            .replace("$format}", "Image")
            .replace("${size}", this.options.resolutionX + "," + this.options.resolutionY);
         return this.loadImage(url, this.options.bbox);
      }

      // Fall through here to get the metadata first.
      return new EsriImageryLoader(options).load().then(esriData => {
         // Get the extent returned by ESRI
         let extent = esriData.extent;
         let bbox = [
            extent.xmin,
            extent.ymin,
            extent.xmax,
            extent.ymax
         ];

         this.dispatchEvent(new Event(WcsEsriImageryParser.BBOX_CHANGED_EVENT,
            Object.assign({
               bbox,
               aspectRatio: esriData.width / esriData.height
            },
            esriData)
         ));
         return this.loadImage(esriData.href, bbox);
      });
   }
}
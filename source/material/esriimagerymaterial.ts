export class EsriImageryMaterial extends THREE.MeshPhongMaterial {

   constructor(public options: any) {
      super({
         map: getLoader(),
         transparent: true,
         opacity: options.opacity ? options.opacity : 1,
         side: THREE.DoubleSide
      });

      function getLoader() {
         let loader = new THREE.TextureLoader();
         loader.crossOrigin = "";
         return loader.load(options.url);
      }
   }
}
export class WmsMaterial extends THREE.MeshPhongMaterial {

   constructor(public options: {width: number, height: number, template: string, bbox: number[], opacity: number, onLoad?: (texture: THREE.Texture) => void}) {
      super({
         map: getLoader(options.onLoad),
         transparent: true,
         opacity: options.opacity ? options.opacity : 1,
         side: THREE.DoubleSide
      });

      function getLoader(onLoad?: (texture: THREE.Texture) => void) {
         let loader = new THREE.TextureLoader();
         loader.crossOrigin = "";
         let url = options.template
            .replace("${width}", options.width ? options.width : 512)
            .replace("${height}", options.height ? options.height : 512)
            .replace("${bbox}", options.bbox.join(","));
         return loader.load(url, onLoad);
      }
   }
}
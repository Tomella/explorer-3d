export class WmsMaterial extends THREE.MeshPhongMaterial {

   constructor(public options: any) {
      super(options);

      let loader = new THREE.TextureLoader();
      loader.crossOrigin = "";
      let url = this.options.imageryTemplate
         .replace("${width}", this.options.imageWidth ? this.options.imageWidth : 512)
         .replace("${height}", this.options.imageHeight ? this.options.imageHeight : 512)
         .replace("${bbox}", this.options.bbox.join(","));

      let opacity = this.options.opacity ? this.options.opacity : 1;
      this.setValues({
         map: loader.load(url),
         transparent: true,
         opacity: opacity,
         side: THREE.DoubleSide
      });
   }
}
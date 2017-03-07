export class ElevationMaterial extends THREE.MeshPhongMaterial {
   static DEFAULT_MAX_DEPTH = 5000;
   static DEFAULT_MAX_ELEVATION = 2200;

   /**
    * Options:
    *    mandatory:
    *       resolutionX
    *       resolutionY
    *       data          // Single dimension array of z values

    *    optional:
    *       maxDepth     // Used to scale water, default 5000m (positive depth)
    *       maxElevation // Used to scale elevation, default 2200m
    */
   constructor(public options: any) {
      super(options);

      let res = options.data;
      let mask = document.createElement("canvas");
      let resolutionX = mask.width = options.resolutionX;
      let resolutionY = mask.height = options.resolutionY;
      let context = mask.getContext("2d");
      let id = context.createImageData(1, 1);
      let d  = id.data;

      // TODO: Some magic numbers. I need think about them. I think the gradient should stay the same.
      let maxDepth = options.maxDepth ? options.maxDepth : ElevationMaterial.DEFAULT_MAX_DEPTH;
      let maxElevation = options.maxElevation ? options.maxElevation : ElevationMaterial.DEFAULT_MAX_ELEVATION;
      let blue = new THREE.Lut("water", maxDepth);
      let lut  = new THREE.Lut("land", maxElevation);
      blue.setMax(0);
      blue.setMin(-maxDepth);
      lut.setMax(Math.floor(maxElevation));
      lut.setMin(0);

      let index = 0;
      let count = 0;

      res.forEach((item, i) => {
         let z = item.z;

         if (z > 0) {
            let color = lut.getColor(z);
            drawPixel(i % resolutionX, Math.floor(i / resolutionX), color.r * 255, color.g * 255, color.b * 255, 255);
         } else {
            let color = blue.getColor(z);
            drawPixel(i % resolutionX, Math.floor(i / resolutionX), color.r * 255, color.g * 255, color.b * 255, 255);
         }
      });

      let texture = new THREE.Texture(mask);
      texture.needsUpdate = true;
      let opacity = options.opacity ? options.opacity : 1;

      this.setValues({
         map: texture,
         transparent: true,
         opacity: opacity,
         side: THREE.DoubleSide
      });

      function fillColor() {
         setTimeout(() => {
            if (count >= res.length) {
               return;
            }

            do {
               let item = res[count++];
               let z = item.z;
               if (!item) {
                  break;
               }

               if (z > 0) {
                  let color = lut.getColor(z);
                  drawPixel(i % resolutionX, Math.floor(i / resolutionX), color.r * 255, color.g * 255, color.b * 255, 255);
               } else {
                  let color = blue.getColor(z);
                  drawPixel(i % resolutionX, Math.floor(i / resolutionX), color.r * 255, color.g * 255, color.b * 255, 255);
               }
            } while (count % 4000);
            fillColor();
         });
      }

      function drawPixel(x, y, r, g, b, a) {
         d[0]   = r;
         d[1]   = g;
         d[2]   = b;
         d[3]   = a;
         context.putImageData( id, x, y );
      }
   }
}
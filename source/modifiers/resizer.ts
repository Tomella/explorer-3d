/**
 *  Resizer
 *
 * Sadly it relies on the perspectve camera.
 *
 * Make sure you destroy on killing the camera or renderer.
 * It would have been nice to trigger off an event but I couldn't see one to grab.
 */

export class Resizer {
   constructor(public renderer: THREE.Renderer, public camera: THREE.PerspectiveCamera, public container: HTMLElement | Window = window) {
      window.addEventListener("resize", this.update, false);
   }

   resize() {
      this.update();
   }

   destroy() {
      window.removeEventListener("resize", this.update);
   }

   update = () => {
      let size = this.container.getBoundingClientRect();
      this.renderer.setSize(size.width, size.height);
      this.camera.aspect = size.width / size.height;
      this.camera.updateProjectionMatrix();
   }
}


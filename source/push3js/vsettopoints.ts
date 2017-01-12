import { TSurf } from "../gocad/tsurf";
import { Event } from "../domain/event";
import { Pipeline } from "./pipeline";
import { BoxFactory } from "../factory/boxfactory";
import { TsurfEventTypes } from "../domain/tsurfeventtypes";

export class VSetToPoints extends Pipeline {
   geometry: THREE.Geometry;

   constructor() {
      super();
   }

   destroy() {
      this.geometry = null;
      super.destroy();
   }

   pipe(event: any): void {
      let data = event.data;
      switch (event.eventName) {
         case "header":
            this.processHeader(data);
            break;
         case "vertices":
            this.processVertices(data);
            break;
         case "complete":
            this.complete(data);
      }
   }

   private complete(data) {
      if (!this.geometry) {
         this.dispatchEvent(new Event("error", "We have complete before we even started"));
         this.destroy();
         return;
      }

      let mat = new THREE.PointsMaterial({ size: 16, color: data.header.color });
      this.geometry.boundingBox = BoxFactory.toThreeBox3(data.bbox);
      let particles = new THREE.Points(this.geometry, mat);

      this.geometry.computeBoundingSphere();

      particles.userData = {
         header: data.header,
         coordinateSystem: data.coordinateSystem
      };

      this.dispatchEvent(new Event("complete", particles));
      this.destroy();
   }

   private processVertices(vertices) {
      if (!this.geometry) {
         this.dispatchEvent(new Event("error", "We have vertices before we have the header"));
         this.destroy();
         return;
      }

      let target = this.geometry.vertices;
      vertices.forEach(vertex => {
         target.push(new THREE.Vector3(vertex[0], vertex[1], vertex[2]));
      });
      console.log("WE have " + target.length + " vertices now");
   }

   private processHeader(data) {
      if (this.geometry) {
         this.dispatchEvent(new Event("error", "We already have processed a header. How did this happen?"));
         this.destroy();
         return;
      }

      this.geometry = new THREE.Geometry();
   }
}



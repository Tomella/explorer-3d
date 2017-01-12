import { TSurf } from "../gocad/tsurf";
import { Event } from "../domain/event";
import { Pipeline } from "./pipeline";
import { BoxFactory } from "../factory/boxfactory";
import { TsurfEventTypes } from "../domain/tsurfeventtypes";

export class TSurfToMesh extends Pipeline {
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
         case "faces":
            this.processFaces(data);
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
      this.geometry.boundingBox = BoxFactory.toThreeBox3(data.bbox);

      let color = data.header.solidColor;
      let mat = new THREE.MeshLambertMaterial({
         color: color ? color : 0xff1111,
         side: THREE.DoubleSide
      });

      let mesh = new THREE.Mesh(this.geometry, mat);
      mesh.userData = {
         header: data.header,
         coordinateSystem: data.coordinateSystem
      };
      this.dispatchEvent(new Event("complete", mesh));
      this.destroy();
   }

   private processFaces(faces) {
      if (!this.geometry) {
         this.dispatchEvent(new Event("error", "We have faces befor we have the header"));
         this.destroy();
         return;
      }

      let target = this.geometry.faces;
      faces.forEach(face => {
         let response = new THREE.Face3(face[0], face[1], face[2]);
         let normal = face[3];
         response.normal = new THREE.Vector3(normal.x, normal.y, normal.z);
         target.push(response);
      });
   }

   private processVertices(vertices) {
      if (!this.geometry) {
         this.dispatchEvent(new Event("error", "We have vertices befor we have the header"));
         this.destroy();
         return;
      }

      let target = this.geometry.vertices;
      vertices.forEach(vertex => {
         target.push(new THREE.Vector3(vertex[0], vertex[1], vertex[2]));
      });
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

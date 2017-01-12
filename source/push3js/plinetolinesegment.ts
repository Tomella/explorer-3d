import { range } from "../util/range";
import { PLine } from "../gocad/pline";
import { Event } from "../domain/event";
import { Pipeline } from "./pipeline";
import { BoxFactory } from "../factory/boxfactory";

export class PLineToLineSegments extends Pipeline {
   geometry: THREE.Geometry;
   pline: any;
   solidColorObj: THREE.Color;
   hasColors: boolean;
   material: THREE.LineBasicMaterial;
   min: number;
   max: number;
   ws: number[];

   constructor() {
      super();
      this.hasColors = false;
   }

   destroy() {
      this.geometry = this.pline = this.solidColorObj = this.material = null;
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

   private complete(pline) {
      if (!this.geometry) {
         this.dispatchEvent(new Event("error", "We have complete before we even started"));
         this.destroy();
         return;
      }

      let lut = null;
      let solidColorObj = this.solidColorObj;
      let colors = this.geometry.colors;
      if (!this.geometry.colors.length && this.geometry.vertices.length) {
         let range = Math.floor(this.max - this.min);
         if (range) {
            lut = new THREE.Lut("rainbow", Math.floor(this.max - this.min));
            lut.setMax(Math.floor(this.max));
            lut.setMin(Math.floor(this.min));

            this.ws.forEach((w) => {
               let color = lut.getColor(w);
               color = color ? color : solidColorObj;
               colors.push(color);
            });
         } else {
            this.geometry.vertices.forEach(() => {
               colors.push(solidColorObj);
            });
         }
      }

      this.geometry.computeBoundingBox();
      this.geometry.computeBoundingSphere();

      let lines = new THREE.LineSegments(this.geometry, this.material);

      lines.userData = {
         header: pline.header,
         coordinateSystem: pline.coordinateSystem
      };

      this.dispatchEvent(new Event("complete", lines));
      this.destroy();
   }

   private processVertices(vertices) {
      if (!this.geometry) {
         this.dispatchEvent(new Event("error", "We have vertices before we have the header"));
         this.destroy();
         return;
      }

      let target = this.geometry.vertices;
      let colors = this.geometry.colors;
      let solidColorObj = this.solidColorObj;
      vertices.forEach((vertex, i) => {
         target.push(new THREE.Vector3(vertex[0], vertex[1], vertex[2]));
         if (vertex.length < 3) {
            colors.push(solidColorObj);
         } else {
            let w = +vertex[3];
            this.min = Math.min(this.min, w);
            this.max = Math.max(this.max, w);
            this.ws.push(w);
         }
      });
      console.log("WE have " + target.length + " vertices now");
   }

   /*
         lines.forEach((line: number[][]) => {
            line.forEach((seg: number[], index: number) => {
               let vertex = vertices[seg[0]];
               let color = vertex > 3 ? lut.getColor(parseInt(vertex[3])) : solidColorObj;
               color = color ? color : solidColorObj;
               geometry.vertices.push(new THREE.Vector3(vertex[0], vertex[1], vertex[2]));
               geometry.colors.push(color);

               vertex = vertices[seg[1]];
               color = vertex.length > 3 ? lut.getColor(parseInt(vertex[3])) : solidColorObj;
            color = color ? color : solidColorObj;
            geometry.vertices.push(new THREE.Vector3(vertex[0], vertex[1], vertex[2]));
            geometry.colors.push(color);
         });
      });
   */





   private processHeader(data) {
      if (this.geometry) {
         this.dispatchEvent(new Event("error", "We already have processed a header. How did this happen?"));
         this.destroy();
         return;
      }
      this.geometry = new THREE.Geometry();
      this.pline = data;
      let rawColor = data.header.color ? data.header.color : 0xffffff;
      this.solidColorObj = new THREE.Color(rawColor);

      let width = data.header.width ? data.header.width : 10;

      this.material = new THREE.LineBasicMaterial({
         linewidth: width,
         color: rawColor, // pline.header.color,
         vertexColors: THREE.VertexColors
      });

      this.min = Infinity;
      this.max = -Infinity;
      this.ws = [];
   }
}

/*

   geometry.computeBoundingBox();
   geometry.computeBoundingSphere();
   return new THREE.LineSegments(geometry, material);

*/
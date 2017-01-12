import { atom } from "../gocad/atom";
import { segment } from "../gocad/segment";
import { vertex } from "../gocad/vertex";
import { BoxFactory } from "../factory/boxfactory";
import { CoordinateSystemPusher } from "./coordinatesystempusher";
import { Event } from "../domain/event";
import { PLineHeader } from "../gocad/plineheader";
import { PLineHeaderPusher } from "./plineheaderpusher";
import { PLine } from "../gocad/pline";
import { Pusher } from "./pusher";
import { StatePusher } from "./statepusher";

export class PLinePusher extends StatePusher<PLine>  {
   static PAGE_SIZE = 32 * 1024;
   pline: PLine;
   child: Pusher<any>;
   zSign: number;
   verticesBuffer: any[];
   segmentsBuffer: any[];

   /**
    * We come in here on the next line
    */
   constructor(public projectionFn?: Function) {
      super();
      this.pline = new PLine();
      this.verticesBuffer = [];
      this.segmentsBuffer = [];
   }

   get obj(): PLine {
      return this.pline;
   }

   push(line: string): boolean {
      if (this.complete) {
         throw new Error("Pushed line to completed tsolid pusher");
      }
      switch (this.state) {
         case 0:
            return this.expectHeader(line);
         case 1:
            return this.pushHeader(line);
         case 2:
            return this.pushCs(line);
         case 3:
            return this.expectIline(line);
         case 4:
            return this.pushData(line);
      }
      return true;
   }

   private expectHeader(line: string): boolean {
      line = line.trim();
      if (!line.startsWith("HEADER")) {
         return true;
      }

      if (!line || line.indexOf("{") === -1) {
         this.complete = true;
         return true;
      }
      this.child = new PLineHeaderPusher();
      this.state++;
      return true;
   }

   private pushHeader(line: string): boolean {
      let accepted = this.child.push(line);

      if (this.child.complete) {
         this.state++;
         this.pline.header = this.child.obj;
         this.child = new CoordinateSystemPusher();
      }
      return accepted;
   }

   private pushCs(line: string): boolean {
      let response = this.child.push(line);
      if (this.child.complete) {
         this.state++;
         if (this.child.isValid) {
            this.pline.coordinateSystem = this.child.obj;
            this.zSign = this.pline.coordinateSystem["ZPOSITIVE"] === "Depth" ? -1 : 1;
         }
         this.dispatchEvent(new Event("header", this.pline));
      }
      return response;
   }

   private expectIline(line) {
      if (line.startsWith("ILINE")) {
         this.state++;
      }
      return true;
   }

   private pushData(line: string = ""): boolean {
      line = line.trim();
      if (!line) {
         return true;
      }

      let pline = this.pline;
      if (line.indexOf("VRTX") === 0 || line.indexOf("PVRTX") === 0) {
         let v = vertex(line, this.projectionFn, this.zSign);
         this.verticesBuffer[v.index] = v.all;
         pline.bbox = BoxFactory.expand(pline.bbox, v.all);
      } else if (line.indexOf("ATOM") === 0 || line.indexOf("PATOM") === 0) {
         let a = atom(line);
         let v = this.verticesBuffer[a.vertexId];
         this.verticesBuffer[a.index] = v;
      } else if (line.indexOf("SEG") === 0) {
         let seg = segment(line);
         this.segmentsBuffer.push(this.verticesBuffer[seg[0]]);
         this.segmentsBuffer.push(this.verticesBuffer[seg[1]]);
         this.checkSegments();
      } else if (line.indexOf("ILINE") === 0 || line.indexOf("END") === 0) {
         this.complete = line.indexOf("END") === 0;
         // The segments never go backwards and we are using the index.
         this.verticesBuffer = [];

         if (this.complete) {
            this.flushSegments();
            this.dispatchEvent(new Event("complete", {
               header: pline.header,
               coordinateSystem: pline.coordinateSystem,
               bbox: pline.bbox
            }));
         }
      }
      return true;
   }

   private checkSegments() {
      if (this.segmentsBuffer.length >= PLinePusher.PAGE_SIZE) {
         this.flushSegments();
      }
   }

   private flushSegments() {
      // They are just pairs of vertices, nothing special
      this.segmentsBuffer = this.flush("vertices", this.segmentsBuffer);
   }

   private flush(name: string, arr: any[]): any[] {
      if (arr.length) {
         this.dispatchEvent(new Event(name, arr));
      }
      return [];
   }
}

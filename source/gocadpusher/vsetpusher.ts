import { atom } from "../gocad/atom";
import { vertex } from "../gocad/vertex";
import { VSet } from "../gocad/vset";
import { Pusher } from "./pusher";
import { StatePusher } from "./statepusher";
import { VSetHeaderPusher } from "./vsetheaderpusher";
import { CoordinateSystemPusher } from "./coordinatesystempusher";

export class VSetPusher extends StatePusher<VSet> {
   vset: VSet;
   child: Pusher<any>;
   zSign: number;
   /**
    * We come in here on the next line
    */
   constructor(public projectionFn?: Function) {
      super();
      this.vset = new VSet();
   }

   get obj() {
      return this.vset;
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
            return this.pushData(line);
      }
      return true;
   }

   private expectHeader(line: string = ""): boolean {
      line = line.trim();
      if (!line.startsWith("HEADER")) {
         return true;
      }
      if (line.indexOf("{") === -1) {
         this.complete = true;
      }
      this.child = new VSetHeaderPusher();
      this.state++;
      return true;
   }

   private pushHeader(line: string = ""): boolean {
      let accepted = this.child.push(line);
      if (this.child.complete) {
         this.state++;
         this.vset.header = this.child.obj;
         this.child = new CoordinateSystemPusher();
         this.zSign = 1;
      }
      return accepted;
   }

   private pushCs(line: string): boolean {
      let response = this.child.push(line);
      if (this.child.complete) {
         this.state++;
         this.vset.coordinateSystem = this.child.obj;
         this.zSign = this.vset.coordinateSystem["ZPOSITIVE"] === "Depth" ? -1 : 1;
      }
      return response;
   }

   private pushData(line: string = ""): boolean {
      line = line.trim();
      if (line) {
         if (line.indexOf("VRTX") === 0 || line.indexOf("PVRTX") === 0) {
            let v = vertex(line, this.projectionFn, this.zSign);
            this.vset.vertices[v.index] = v.all;
         } else if (line.indexOf("ATOM") === 0 || line.indexOf("PATOM") === 0) {
            let a = atom(line);
            this.vset.vertices[a.index] = this.vset.vertices[a.vertexId];
         } else if (line.startsWith("END") && !line.startsWith("END_")) {
            this.complete = true;
         }
      }
      return true;
   }
}
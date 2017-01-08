import { atom } from "../gocad/atom";
import { StatePusher } from "./statepusher";
import { TSolid } from "../gocad/tsolid";
import { tetra } from "../gocad/tetra";
import { Type } from "../gocad/type";
import { vertex } from "../gocad/vertex";
import { Header } from "../gocad/header";
import { Pusher } from "./pusher";
import { HeaderPusher } from "./headerpusher";
import { CoordinateSystemPusher } from "./coordinatesystempusher";

export class TSolidPusher extends StatePusher<TSolid> {
   tsolid: TSolid;
   child: Pusher<any>;
   zSign: number;

   constructor(public projectionFn?: Function) {
      super();
      this.tsolid = new TSolid();
   }

   get obj(): TSolid {
      return this.tsolid;
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
            return this.expectTvolume(line);
         case 4:
            return this.pushData(line);
      }
      return true;
   }

   private expectHeader(line: string ): boolean {
      if (line.startsWith("HEADER")) {
         this.child = new HeaderPusher();
         this.state++;
      }
      return true;
   }

   private pushHeader(line: string): boolean {
      let response = this.child.push(line);
      if (this.child.complete) {
         this.state++;
         this.tsolid.header = this.child.obj;
         this.child = new CoordinateSystemPusher();
      }
      return response;
   }

   private pushCs(line: string): boolean {
      let response = this.child.push(line);
      if (this.child.complete) {
         this.state++;
         this.tsolid.coordinateSystem = this.child.obj;
         this.zSign = this.tsolid.coordinateSystem["ZPOSITIVE"] === "Depth" ? -1 : 1;
      }
      return response;
   }

   private expectTvolume(line: string) {
      if (line.startsWith("TVOLUME")) {
         this.state++;
      }
      return true;
   }

   private pushData(line: string): boolean {
      line = line.trim();
      if (line === "END") {
         if (line.indexOf("VRTX") === 0 || line.indexOf("PVRTX") === 0) {
            let v = vertex(line, this.projectionFn, this.zSign);
            this.tsolid.vertices[v.index] = v.all;
         } else if (line.indexOf("ATOM") === 0 || line.indexOf("PATOM") === 0) {
            let a = atom(line);
            this.tsolid.vertices[a.index] = this.tsolid.vertices[a.vertexId];
         } else if (line.indexOf("TETRA") === 0) {
            this.tsolid.tetras.push(tetra(line));
         }
      } else {
         this.complete = true;
      }
      return true;
   }
}

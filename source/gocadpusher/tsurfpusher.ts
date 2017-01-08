import { atom } from "../gocad/atom";
import { border } from "../gocad/border";
import { bstone } from "../gocad/bstone";
import { face } from "../gocad/face";
import { vertex } from "../gocad/vertex";

import { TSurf } from "../gocad/tsurf";
import { CoordinateSystemPusher } from "./coordinatesystempusher";
import { HeaderPusher } from "./headerpusher";
import { StatePusher } from "./statepusher";
import { Header }from "../gocad/header";

export class TSurfPusher extends StatePusher<TSurf> {
   tsurf: TSurf;
   headerPusher: HeaderPusher;
   csPusher: CoordinateSystemPusher;
   zSign: number;
   readTface: boolean;
   state: number;

   /**
    * We come in here on the next line
    */
   constructor(public projectionFn?: Function) {
      super();
      this.tsurf = new TSurf();
      this.zSign = 1;
      this.readTface = false;
   }

   get obj() {
      return this.tsurf;
   }

   push(line: string): boolean {
      if (this.complete) {
         throw new Error("Pushed line to completed tsurf pusher");
      }
      switch (this.state) {
         case 0:
            return this.waitForHead(line);
         case 1:
            return this.loadHeader(line);
         case 2:
            return this.loadCs(line);
         case 3:
            return this.waitForTface(line);
         case 4:
            return this.processToEnd(line);
      }
   }

   private waitForHead(line): boolean {
      // Gobble up comments and blank lines
      if (line.startsWith("HEADER")) {
         if (line.indexOf("{") === -1) {
            this.complete = true;
         } else {
            this.headerPusher = new HeaderPusher();
         }
         this.state++;
      }
      return true;
   }

   private loadHeader(line) {
      this.headerPusher.push(line);
      if (this.headerPusher.complete) {
         this.tsurf.header = this.headerPusher.obj;
         this.csPusher = new CoordinateSystemPusher();
         this.state++;
      }
      return true;
   }

   private loadCs(line: string): boolean {
      this.csPusher.push(line);
      if (this.csPusher.complete && this.csPusher.obj.isValid) {
         this.tsurf.coordinateSystem = this.csPusher.obj;
         this.zSign = this.tsurf.coordinateSystem["ZPOSITIVE"] === "Depth" ? -1 : 1;
         this.state++;
      }
      return true;
   }

   private waitForTface(line: string): boolean {
      if (!line.indexOf("TFACE")) {
         this.state++;
      }
      return true;
   }

   private processToEnd(line) {
      line = line.trim();
      if (line === "END") {
         this.complete = true;
         this.state = 99;
      } else {
         let tsurf = this.tsurf;
         if (line.indexOf("VRTX") === 0 || line.indexOf("PVRTX") === 0) {
            let v = vertex(line, this.projectionFn, this.zSign);
            tsurf.vertices[v.index] = v.all;
         } else if (line.indexOf("ATOM") === 0 || line.indexOf("PATOM") === 0) {
            let a = atom(line);
            tsurf.vertices[a.index] = tsurf.vertices[a.vertexId];
         } else if (line.indexOf("TRGL") === 0) {
            tsurf.faces.push(face(line).abc);
         } else if (line.indexOf("BSTONE") === 0) {
            tsurf.bstones.push(bstone(line));
         } else if (line.indexOf("BORDER") === 0) {
            let b = border(line);
            tsurf.borders[b.id] = [b.vertices[0], b.vertices[1]];
         }
      }
      return true;
   }
}

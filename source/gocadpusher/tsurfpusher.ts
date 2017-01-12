import { atom } from "../gocad/atom";
import { border } from "../gocad/border";
import { bstone } from "../gocad/bstone";
import { face } from "../gocad/face";
import { vertex } from "../gocad/vertex";

import { Box } from "../gocad/box";
import { Event } from "../domain/event";
import { BoxFactory } from "../factory/boxfactory";
import { FaceFactory } from "../factory/facefactory";
import { TSurf } from "../gocad/tsurf";
import { CoordinateSystemPusher } from "./coordinatesystempusher";
import { HeaderPusher } from "./headerpusher";
import { StatePusher } from "./statepusher";
import { Header } from "../gocad/header";

export class TSurfPusher extends StatePusher<TSurf> {
   static PAGE_SIZE = 64 * 1024;
   tsurf: TSurf;
   headerPusher: HeaderPusher;
   csPusher: CoordinateSystemPusher;
   zSign: number;
   readTface: boolean;
   state: number;

   facesBuffer: any[];
   verticesBuffer: any[];
   bordersBuffer: any[];
   bstonesBuffer: any[];

   /**
    * We come in here on the next line
    */
   constructor(public projectionFn?: Function) {
      super();
      this.tsurf = new TSurf();
      this.zSign = 1;
      this.readTface = false;
      this.verticesBuffer = [];
      this.facesBuffer = [];
      this.bordersBuffer = [];
      this.bstonesBuffer = [];
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
      if (this.csPusher.complete) {
         if ( this.csPusher.obj.isValid) {
            this.tsurf.coordinateSystem = this.csPusher.obj;
            this.zSign = this.tsurf.coordinateSystem["ZPOSITIVE"] === "Depth" ? -1 : 1;
         }
         this.state++;
         this.dispatchEvent(new Event("header", this.tsurf));
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
         this.flushVertices();
         this.flushFaces();
         this.flushBstones();
         this.flushBorders();
         this.tsurf.vertices = [];
         this.dispatchEvent(new Event("complete", {
            header: this.tsurf.header,
            coordinateSystem: this.tsurf.coordinateSystem,
            bbox: this.tsurf.bbox
         }));

      } else {
         let tsurf = this.tsurf;
         let index = line.indexOf("VRTX");
         if (index === 0 || index === 1) {
            let v = vertex(line, this.projectionFn, this.zSign);
            tsurf.vertices[v.index] = v.all;

            this.tsurf.bbox = BoxFactory.expand(this.tsurf.bbox, v.all);
            this.checkVertices(v.all); // Got to hang on to vertices for easy lookup
         } else if (line.indexOf("ATOM") === 0 || line.indexOf("PATOM") === 0) {
            let a = atom(line);
            this.checkVertices(tsurf.vertices[a.index] = tsurf.vertices[a.vertexId]);  // Got to hang on to vertices for easy lookup
         } else if (line.indexOf("TRGL") === 0) {
            let next = face(line).abc;
            FaceFactory.computeNormal(next, this.tsurf.vertices);
            // tsurf.faces.push(next); // We don't need faces anymore now that we are event driven
            this.checkFaces(next);
         } else if (line.indexOf("BSTONE") === 0) {
            let bs = bstone(line);
            // tsurf.bstones.push(bs); // We don't need bstones anymore now that we are event driven
            this.checkBstones(bs);
         } else if (line.indexOf("BORDER") === 0) {
            let b = border(line);
            // tsurf.borders[b.id] = [b.vertices[0], b.vertices[1]]; // We don't need borders anymore now that we are event driven
            this.checkBorders([b.vertices[0], b.vertices[1]]);
         }
      }
      return true;
   }

   private checkVertices(vertex: any) {
      this.verticesBuffer.push(vertex);
      if (this.verticesBuffer.length >= TSurfPusher.PAGE_SIZE) {
         this.flushVertices();
      }
   }

   private flushVertices() {
      this.verticesBuffer = this.flush("vertices", this.verticesBuffer);
   }

   private checkFaces(face: any) {
      this.facesBuffer.push(face);
      if (this.facesBuffer.length >= TSurfPusher.PAGE_SIZE) {
         this.flushFaces();
      }
   }

   private flushFaces() {
      this.facesBuffer = this.flush("faces", this.facesBuffer);
   }

   private checkBorders(face: any) {
      this.bordersBuffer.push(face);
      if (this.bordersBuffer.length >= TSurfPusher.PAGE_SIZE) {
         this.flushBorders();
      }
   }

   private flushBorders() {
      this.bordersBuffer = this.flush("borders", this.bordersBuffer);
   }

   private checkBstones(face: any) {
      this.bstonesBuffer.push(face);
      if (this.bstonesBuffer.length >= TSurfPusher.PAGE_SIZE) {
         this.flushBstones();
      }
   }

   private flushBstones() {
      this.bstonesBuffer = this.flush("bstones", this.bstonesBuffer);
   }

   private flush(name: string, arr: any[]): any[] {
      if (arr.length) {
         this.dispatchEvent(new Event(name, arr));
      }
      return [];
   }
}

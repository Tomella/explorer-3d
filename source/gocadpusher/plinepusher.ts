import { atom } from "../gocad/atom";
import { segment } from "../gocad/segment";
import { vertex } from "../gocad/vertex";
import { CoordinateSystemPusher } from "./coordinatesystempusher";
import { PLineHeader } from "../gocad/plineheader";
import { PLineHeaderPusher } from "./plineheaderpusher";
import { PLine } from "../gocad/pline";
import { Pusher } from "./pusher";
import { StatePusher } from "./statepusher";

export class PLinePusher extends StatePusher<PLine>  {
   pline: PLine;
   child: Pusher<any>;
   zSign: number;
   startIndex: number;
   lastIndex: number;
   hasSeg: boolean;
   lineSegments: number[][];

   /**
    * We come in here on the next line
    */
   constructor(public projectionFn?: Function) {
      super();
      this.pline = new PLine();
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
      }
      return response;
   }

   private expectIline(line) {
      if (line.startsWith("ILINE")) {
         this.state++;
         this.startIndex = 1;
         this.lastIndex = 1;
         this.hasSeg = false;
         this.lineSegments = [];
      }
      return true;
   }

   private pushData(line: string = ""): boolean {
      line = line.trim();
      if (!line) {
         return true;
      }

      if (line.indexOf("VRTX") === 0 || line.indexOf("PVRTX") === 0) {
         let v = vertex(line, this.projectionFn, this.zSign);
         this.pline.vertices[v.index] = v.all;
         this.lastIndex = v.index;
      } else if (line.indexOf("ATOM") === 0 || line.indexOf("PATOM") === 0) {
         let a = atom(line);
         this.pline.vertices[a.index] = this.pline.vertices[a.vertexId];
      } else if (line.indexOf("SEG") === 0) {
         this.lineSegments.push(segment(line));
         this.hasSeg = true;
      } else if (line.indexOf("ILINE") === 0 || line.indexOf("END") === 0) {
         this.complete = line.indexOf("END") === 0;
         if (!this.hasSeg && this.lastIndex > this.startIndex) {
            // We have to step over every vertex pair from start index to lastIndex
            for (let i = this.startIndex; i < this.lastIndex; i++) {
               this.lineSegments.push([i, i + 1]);
            }
         }
         this.pline.lines.push(this.lineSegments);
         this.lineSegments = [];
         this.startIndex = this.lastIndex + 1;
         this.hasSeg = false;
      }

      return true;
   }
}

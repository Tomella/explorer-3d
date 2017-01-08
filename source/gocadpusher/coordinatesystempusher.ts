import { CoordinateSystem } from "../gocad/coordinatesystem";
import { StatePusher } from "./statepusher";
import { isNonEmpty, isDataLine } from "../util/linehelper";

export class CoordinateSystemPusher extends StatePusher<CoordinateSystem> {
   coordinateSystem: CoordinateSystem;
   validHeader: boolean;

   constructor() {
      super();
      this.coordinateSystem = new CoordinateSystem();
      this.validHeader = false;
   }

   get obj() {
      return this.coordinateSystem;
   }

   push(line): boolean {
      if (this.complete) {
         throw new Error("Pushed line to completed tsurf pusher");
      }
      switch (this.state) {
         case 0:
            return this.hasBlock(line);
         case 1:
            return this.pushData(line);
      }
   }

   private hasBlock(line: string): boolean {
      line = line.trim();
      if (line.length) {
         if (line !== "GOCAD_ORIGINAL_COORDINATE_SYSTEM") {
            this.complete = true;
            this.coordinateSystem.isValid = false;
            // Reject line
            return false;
         } else {
            this.state++;
         }
      }
      return true;
   }

   private pushData(line: string): boolean {
      if (isDataLine(line)) {
         if (line !== "END_ORIGINAL_COORDINATE_SYSTEM") {
            let index = line.indexOf(" ");
            if (index > 0) {
               let name = line.substring(0, index);
               let rest = line.substring(index).trim();
               let mapper: Function = this.coordinateSystem.typeMap[name] ? this.coordinateSystem.typeMap[name] : function (val: string) { return val; };
               this.coordinateSystem[name] = mapper(rest);
            }
         } else {
            this.coordinateSystem.typeMap = null;
            this.complete = true;
         }
      }
      return true;
   }
}
import * as util from "../util/LineReader";
import * as event from "../util/EventDispatcher";
import * as head from "./Header";
import * as coords from "./CoordinateSystem";

export class Type extends event.EventDispatcher {
   public type: string = "Type";
   public header: head.Header;
   public coordinateSystem: coords.CoordinateSystem;
   public projectionFn: Function = function (coords: any) {
      return coords;
   };

   private reader: util.LineReader;
   public isValid: boolean;

   /**
    * We come in here on the next line
    */
   constructor(reader: util.LineReader, projectionFn?: Function) {
      super();
      this.isValid = false;
      this.reader = reader;
      if (projectionFn) {
         this.projectionFn = projectionFn;
      }
   }

   clear(): void {
      this.reader = null;
   }
}

export function atom(atm: string) {
   let parts = atm.split(/\s+/g);
   let length = parts.length;
   let response: any = {
      get xyz() {
         return [this.x, this.y, this.z];
      }
   };

   parts.forEach((item, i) => {
      switch (i) {
         case 0: break;
         case 1:
            response.index = parseInt(item);
            break;
         case 2:
            response.vertexId = parseFloat(item);
            break;
         case 3:
            response.properties = [];
         // Fall through to populate
         default:
            response.properties.push(item);
      }
   });
   return response;
}

export function vertex(vrtx: string, projectionFn: Function, zDirection?: number) {
   let parts = vrtx.split(/\s+/g);
   let length = parts.length;
   let zSign = zDirection ? zDirection : 1;
   let coord: number[] = [];

   let response: any = {
      get xyz() {
         return [this.x, this.y, this.z];
      },
      get all() {
         let data = [this.x, this.y, this.z];
         if (this.properties) {
            this.properties.forEach((item: any) => {
               data.push(item);
            });
         }
         return data;
      }
   };

   parts.forEach((item, i) => {
      switch (i) {
         case 0: break;
         case 1:
            response.index = parseInt(item);
            break;
         case 2:
            coord[0] = parseFloat(item);
            // response.x = parseFloat(item);
            break;
         case 3:
            coord[1] = parseFloat(item);
            // response.y = parseFloat(item);
            break;
         case 4:
            response.z = parseFloat(item) * zSign;
            break;
         case 5:
            response.properties = [];
         // Fall through to populate
         default:
            response.properties.push(item);
      }
   });
   if (projectionFn) {
      coord = projectionFn(coord);
   }
   response.x = coord[0];
   response.y = coord[1];
   return response;
}
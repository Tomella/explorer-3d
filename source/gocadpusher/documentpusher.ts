import { Pusher } from "./pusher";
import { TypeFactoryPusher } from "./typefactorypusher";
import { GocadDocument } from "../gocad/gocaddocument";
import { Event } from "../domain/event";
import { EventNames } from "./eventnames";
import { Logger } from "../util/logger";

export class DocumentPusher extends Pusher<GocadDocument> {
   document: GocadDocument;
   complete: boolean;
   typefactorypusher: TypeFactoryPusher;
   projectionFn: Function;

   constructor(options: any, public proj4?: any) {
      super();

      // They can pick a projection but if the app hasn't loaded the proj4 library we don't do anything as well
      if (options && options.from && options.to && options.from !== options.to && proj4) {
         proj4.defs("EPSG:3112", "+proj=lcc +lat_1=-18 +lat_2=-36 +lat_0=0 +lon_0=134 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
         this.projectionFn = function reproject(from, to) {
            return function (coords) {
               return proj4(from, to, [coords[0], coords[1]]);
            };
         }(options.from, options.to);
      } else {
         this.projectionFn = passThru;
      }

      this.document = new GocadDocument();
      this.typefactorypusher = this.createTypeFactoryPusher(this.projectionFn);
   }

   get obj() {
      return this.document;
   }

   push(line: string): boolean {
      let consumed = this.typefactorypusher.push(line);
      // Well behaved children will have changed state when not consuming so *shouldn't* get in an infinite loop.
      if (!consumed) {
         Logger.log("NOT PUSHED: " + line);
         this.push(line);
         // Just in case they don't behave we'll swallow it.
         return true;
      }

      if (this.typefactorypusher.complete) {
         this.complete = true;
         this.document.types.push(this.typefactorypusher.obj);
         this.destroyTypeFactoryPusher(this.typefactorypusher);
         this.typefactorypusher = this.createTypeFactoryPusher(this.projectionFn);
      }
      return true;
   }

   private createTypeFactoryPusher(projectionFn) {
      let self = this;
      let pusher = new TypeFactoryPusher(projectionFn);
      EventNames.names.forEach(name => {
         pusher.addEventListener(name, this.eventHandler);
      });
      return pusher;
   }

   private destroyTypeFactoryPusher(typefactorypusher: TypeFactoryPusher) {
      EventNames.names.forEach(name => {
         typefactorypusher.removeEventListener(name, this.eventHandler);
      });
   }

   eventHandler = (event: Event) => {
      Logger.log("DP: " + event.type);
      this.dispatchEvent(event);
   }
}

function passThru(coords) {
   return coords;
}
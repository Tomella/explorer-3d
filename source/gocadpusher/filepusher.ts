import { Document } from "../gocad/document";
import { DocumentPusher } from "./documentpusher";
import { LinesPusher } from "../util/linespusher";
import { LinesToLinePusher } from "../util/linestolinepusher";

export class FilePusher {
   projectionFn: Function;

   constructor(public file: File, public options: any, public proj4: any) {
      this.proj4.defs("EPSG:3112", "+proj=lcc +lat_1=-18 +lat_2=-36 +lat_0=0 +lon_0=134 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

      if (options && options.from && options.to && options.from !== options.to) {
         this.projectionFn = function reproject(from, to) {
            return function (coords) {
               return proj4(from, to, [coords[0], coords[1]]);
            };
         }(options.from, options.to);
      } else {
         this.projectionFn = passThru;
      }
   }

   async start() {
      let name = this.file.name;

      return new Promise<Document>(resolve => {
         let pusher = new DocumentPusher(this.projectionFn);

         let linesToLinePusher = new LinesToLinePusher((line) => {
            pusher.push(line);
            if (pusher.complete) {
               resolve(pusher.obj);
            }
         });

         new LinesPusher(this.file, this.options, lines => {
            linesToLinePusher.receiver(lines);
         });
      });
   }
}

function passThru(coords) {
   return coords;
}
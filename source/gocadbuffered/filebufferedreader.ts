
import { Document } from "../gocad/document";
import { DocumentBufferedReader } from "./documentbufferedreader";
import { LineBufferedReader } from "../util/linebufferedreader";

export async function fileBufferedReader(e, proj4): Promise<Document> {
   proj4.defs("EPSG:3112", "+proj=lcc +lat_1=-18 +lat_2=-36 +lat_0=0 +lon_0=134 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");

   let file = e.data.file;
   let options = e.data.options;
   let projectionFn = passThru;

   if (options && options.from && options.to && options.from !== options.to) {
      projectionFn = function reproject(from, to) {
         return function (coords) {
            return proj4(from, to, [coords[0], coords[1]]);
         };
      }(options.from, options.to);
   }

   let name = file.name;

   return new DocumentBufferedReader(new LineBufferedReader(file), projectionFn).read();
}

function passThru(coords) {
   return coords;
}
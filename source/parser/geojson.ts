import { Parser } from "./parser";
/**
 * Parse GeoJSON into our canonical form.
 * WARNING: Not fully working. Last I remember it was just
 * for point clouds.
 */
export class GeoJsonParser extends Parser {
   static WORKER_NAME = "geojson.js";

   public parse(file: File, options: any): Promise<any> {
      return new Promise<any>(resolve => {
         let worker = new Worker(this.getBase() + GeoJsonParser.WORKER_NAME);
         worker.addEventListener("message", function(response) {
            console.log("worker geojson.js finished" );
            resolve(response.data);
         });
         worker.postMessage(file);
      });
   }
}
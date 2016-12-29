import { Parser } from "./parser";

export class GocadParser extends Parser {
   static WORKER_NAME = "gocad.js";

   public parse(file: File, options: any): Promise<any> {
      return new Promise<any>(resolve => {
         let worker = new Worker(this.getBase() + GocadParser.WORKER_NAME);
         worker.addEventListener("message", function(response) {
            console.log("worker geojson.js finished" );
            resolve(response.data);
         });
         worker.postMessage(file);
      });
   }
}
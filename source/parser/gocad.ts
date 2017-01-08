import { Parser } from "./parser";
import { FilePusher } from "../gocadpusher/filepusher";
declare var proj4;

/**
 * Calls a web worker that loads the whole file before parsing. Works OK but uses
 * a lot of memory on huge files (100 - 250 MB is a good limit depending on pc)
 */
export class GocadParser extends Parser {
   static WORKER_NAME = "gocad.js";

   public parse(data: any): Promise<any> {
      return new Promise<any>(resolve => {
         let worker = new Worker(this.getBase() + GocadParser.WORKER_NAME);
         worker.addEventListener("message", function(response) {
            console.log("worker gocad.js finished" );
            worker.terminate();
            resolve(response.data);
         });
         worker.postMessage(data);
      });
   }
}
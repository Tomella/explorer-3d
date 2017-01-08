import { Parser } from "./parser";

export class GocadPusherParser extends Parser {
   static WORKER_NAME = "gocadpusher.js";
   private activeCount: number;

   public parse(data: any): Promise<any> {
      return new Promise<any>(resolve => {
         let worker = new Worker(this.getBase() + GocadPusherParser.WORKER_NAME);
         worker.addEventListener("message", function(response) {
            console.log("worker gocadpusher.js finished" );
            worker.terminate();
            resolve(response.data);
         });

         worker.addEventListener("error", function(err) {
            console.log("There is an error with your worker!");
            console.log(err);
         });

         worker.postMessage(data);
      });
   }
}
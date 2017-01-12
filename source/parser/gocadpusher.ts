import { Parser } from "./parser";
import { PipeToThreedObj } from "../push3js/pipetothreedobj";
import { Logger } from "../util/Logger";


export class GocadPusherParser extends Parser {
   static WORKER_NAME = "gocadpusher.js";
   private activeCount: number;

   constructor(public options: any = {}) {
      super();
   }

   public parse(data: any): Promise<any> {
      return new Promise<any>((resolve, reject) => {
         let worker = new Worker(this.getWorkersBase() + GocadPusherParser.WORKER_NAME);
         let pipe = new PipeToThreedObj();

         pipe.addEventListener("complete", (event) => {
            worker.terminate();
            resolve(event.data);
         });

         pipe.addEventListener("error", (event) => {
            worker.terminate();
            Logger.log("There is an error with your pipes!");
            reject(event.data);
         });

         worker.addEventListener("message", function(response) {
            let message = JSON.parse(response.data);
            pipe.pipe(message);
            Logger.log("EVENT = " + message.eventName );
         });

         worker.addEventListener("error", function(err) {
            Logger.log("There is an error with your worker!");
            Logger.log(err);
         });

         worker.postMessage(data);
      });
   }
}
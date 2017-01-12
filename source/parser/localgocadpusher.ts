import { Parser } from "./parser";
import { Event } from "../domain/event";
import { PipeToThreedObj } from "../push3js/pipetothreedobj";
import { DocumentPusher } from "../gocadpusher/documentpusher";
import { LinesToLinePusher } from "../util/linestolinepusher";
import { LinesPagedPusher } from "../util/linespagedpusher";
import { Logger } from "../util/Logger";

declare var proj4;

let eventList = [
   "start",
   "complete",
   "bstones",
   "borders",
   "header",
   "vertices",
   "faces",
   "lines",
   "properties"
];

/**
 * Uses the block reading parser in the current UI thread. in
 * other words single threading. Mainly for debugging as its
 * easier to debug.
 */
export class LocalGocadPusherParser extends Parser {
   constructor(public options: any = {}) {
      super();
   }

   public parse(data: any): Promise<any> {
      let file = data.file;
      let options = data.options;

      return new Promise<any>((resolve, reject) => {
         let pusher = new DocumentPusher(this.options, proj4);

         // Turn blocks of lines into lines
         let linesToLinePusher = new LinesToLinePusher(function (line) {
            pusher.push(line);
         });

         let pipe = new PipeToThreedObj();
         pipe.addEventListener("complete", (event) => {
            resolve(event.data);
         });

         pipe.addEventListener("error", (event) => {
            Logger.log("There is an error with your pipes!");
            reject(event.data);
         });

         new LinesPagedPusher(file, options, function (lines) {
            linesToLinePusher.receiver(lines);
         }).start().then(function () {
            Logger.log("******************* Local Kaput ****************************");
         });

         eventList.forEach(function (name) {
            Logger.log("Adding listener: " + name);
            pusher.addEventListener(name,
               function defaultHandler(event) {
                  Logger.log("GPW: " + event.type);
                  pipe.pipe({
                     eventName: event.type,
                     data: event.data
                  });
               });
         });
      });
   }
}

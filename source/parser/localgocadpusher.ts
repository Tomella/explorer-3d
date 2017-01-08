import { Parser } from "./parser";
import { FilePusher } from "../gocadpusher/filepusher";
declare var proj4;

/**
 * Uses the block reading parser in the current UI thread. in
 * other words single threading. Mainly for debugging as its
 * easier to debug.
 */
export class LocalGocadPusherParser extends Parser {
   // Easier to debug when running local.
   public parse(data: any): Promise<any> {
      return new Promise<any>(resolve => {
         new FilePusher(data.file, data.options, proj4).start().then(document => {
            resolve(document);
         });
      });
   }
}
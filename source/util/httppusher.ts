import { LinesPusher } from "./linespusher";
import { Logger } from "./logger";

export class HttpPusher implements LinesPusher {
   buffer;

   constructor(public url: string, public callback: Function) {
   }

   start(): Promise<void> {
      return new Promise<void>((resolve, reject) => {
         let get = new XMLHttpRequest();
         let index = 0;
         let pageNo = 0;
         let lineBuffer = [];

         let handleData = () => {
            if (get.readyState !== null && (get.readyState < 4 || get.status !== 200)) {
               return;
            }

            let totalLength = get.responseText.length;

            for ( let i = index; i < totalLength; i++) {
               let char = get.responseText[i];
               if (char === "\r") {
                  continue;
               }
               if (char === "\n") {
                  this.callback(lineBuffer.join(""));
                  lineBuffer = [];
                  continue;
               }
               lineBuffer.push(char);
            }
            index = totalLength;

            Logger.log("Handling data: " + ++pageNo + ", size: " + get.responseText.length + ", state: " + get.readyState);
            if (get.readyState === 4) {
               resolve(null);
            }
         };
         get.onreadystatechange = handleData;

         get.open("get", this.url);
         get.send();

      });
   }
}
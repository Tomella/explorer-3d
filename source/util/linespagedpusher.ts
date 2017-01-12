import { LinesPusher } from "./linespusher";
import { Logger } from "./logger";

export class LinesPagedPusher implements LinesPusher {
   private blockSize = 16 * 1024; // A bit at a time should be harmless
   private pageNo: number;
   private index: number;
   private length: number;
   private buffer: string;
   private lineBuffer: string[];
   private reader: FileReader;

   constructor(public file: File, options: any, public callback: Function) {
      this.file = file;
      this.length = file.size;
      this.pageNo = -1;
      this.index = 0;
      this.blockSize = options.blockSize ? options.blockSize : this.blockSize;
      this.reader;
      this.lineBuffer = [];
      this.reader = new FileReader();
   }

   async start() {
      // Prime the first read
      let result = await this.read();
      let lines = [];

      while (result) {
         let lineResult = this.next();
         switch (lineResult.state) {
            case "more":
               let group = lines;
               lines = [];
               try {
                  this.callback(group);
               } catch (e) {
                  Logger.error(e);
                  Logger.error("Someone died. Continue on.\n\n" + group.join("\n").substr(0, 2000));
               }
               result = await this.read();
               break;
            case "line":
               lines.push(lineResult.line);
               break;
            case "complete":
               lines.push(lineResult.line);
               if (lines.length) {
                  try {
                     this.callback(lines);
                  } catch (e) {
                     Logger.error(e);
                     Logger.error("Someone died. Continue on.\n\n" + lines.join("\n").substr(0, 2000));
                  }
               }
               result = false;
               break;
         }
      }
   }

   async read() {
      this.pageNo++;
      this.index = 0;
      let self = this;
      let start = this.pageNo * this.blockSize;
      Logger.log("Block size: " + this.blockSize + ", file size: " + this.length);
      return new Promise<boolean>(resolve => {
         if (start >= this.length) {
            resolve(false);
            return;
         }
         try {
            self.reader.onloadend = (evt) => {
               Logger.log("We have loaded with ready state = " + evt.target["readyState"]);
               if (evt.target["readyState"] === FileReader.prototype.DONE) { // DONE == 2
                  Logger.log("Reading page " + self.pageNo);
                  self.buffer = evt.target["result"];
                  resolve(this.hasMore());
               }
            };
            self.reader.onerror = (evt) => {
               Logger.log("What do you mean, error");
            };

            let blob = self.file.slice(start, start + self.blockSize);
            self.reader.readAsText(blob);
         } catch (e) {
            Logger.log(e);
         }
      });
   }

   private hasMore() {
      return this.index + this.blockSize * this.pageNo < this.length - 1;
   }

   private next(): any {
      while (this.hasMore()) {
         if (!this.buffer || this.index >= this.blockSize) {
            return { state: "more" };
         }
         let char = this.buffer[this.index++];
         if (char === "\r") {
            continue;
         }
         if (char === "\n") {
            break;
         }
         this.lineBuffer.push(char);
      }
      let line = this.lineBuffer.join("");
      this.lineBuffer = [];
      return {
         state: this.hasMore() ? "line" : "complete",
         line: line
      };
   }
}


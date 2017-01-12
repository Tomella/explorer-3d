import { Logger } from "./logger";

export class LinePusher {
   private PAGE_SIZE = 16 * 1024; // A 16 KB at a time should be harmless
   private pageNo: number;
   private index: number;
   private length: number;
   private buffer: string;
   private lineBuffer: string[];
   private reader: FileReader;

   constructor(public file: File) {
      this.file = file;
      this.length = file.size;
      this.pageNo = -1;
      this.index = 0;
      this.reader = new FileReader();
      this.lineBuffer = [];
   }

   async start(targetFn: Function) {
      // Prime the first read
      let result = await this.read();

      while (result) {
         let lineResult = this.next();
         switch (lineResult.state) {
            case "more":
               result = await this.read();
               break;
            case "line":
               targetFn(lineResult.line);
               break;
            case "complete":
               targetFn(lineResult.line);
               result = false;
               break;
         }
      }
   }

   async read() {
      this.pageNo++;
      this.index = 0;
      let self = this;
      let start = this.pageNo * this.PAGE_SIZE;

      let blob = this.file.slice(start, start + this.PAGE_SIZE);

      this.reader.readAsText(blob);
      return new Promise<boolean>(resolve => {
         if (start >= this.length) {
            resolve(false);
            return;
         }

         self.reader.onloadend = (evt) => {
            if (evt.target["readyState"] === FileReader.prototype.DONE) { // DONE == 2
               Logger.log("Reading page " + self.pageNo);
               self.buffer = evt.target["result"];
               resolve(this.hasMore());
            }
         };
      });
   }

   private hasMore() {
      return this.index + this.PAGE_SIZE * this.pageNo < this.length - 1;
   }

   private next(): any {
      while (this.hasMore()) {
         if (!this.buffer || this.index >= this.PAGE_SIZE)  {
            return {state: "more"};
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

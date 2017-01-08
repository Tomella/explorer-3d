export class LinesPusher {
   private blockSize = 1024 * 1024; // A bit at a time should be harmless
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
      this.reader = new FileReader();
      this.lineBuffer = [];
      this.start();
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
               this.callback(group);
               result = await this.read();
               break;
            case "line":
               lines.push(lineResult.line);
               break;
            case "complete":
               lines.push(lineResult.line);
               if (lines.length) {
                  this.callback(lines);
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

      let blob = this.file.slice(start, start + this.blockSize);

      this.reader.readAsText(blob);
      return new Promise<boolean>(resolve => {
         if (start >= this.length) {
            resolve(false);
            return;
         }

         self.reader.onloadend = (evt) => {
            if (evt.target["readyState"] === FileReader.prototype.DONE) { // DONE == 2
               // console.log("Reading page " + self.pageNo);
               self.buffer = evt.target["result"];
               resolve(this.hasMore());
            }
         };
      });
   }

   private hasMore() {
      return this.index + this.blockSize * this.pageNo < this.length - 1;
   }

   private next(): any {
      while (this.hasMore()) {
         if (!this.buffer || this.index >= this.blockSize)  {
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


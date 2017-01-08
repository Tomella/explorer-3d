export class LineStreamer {
   private PAGE_SIZE = 16 * 1048576; // A mb at a time should be harmless
   private file: File;
   private pageNo: number;
   private index: number;
   private length: number;
   private buffer: string;
   private reader: FileReader;


   constructor(file: File) {
      this.file = file;
      this.length = file.size;
      this.pageNo = -1;
      this.index = 0;
      this.reader = new FileReader();
   }

   async readPage() {
      this.pageNo++;
      this.index = 0;
      let self = this;
      let start = this.pageNo * this.PAGE_SIZE;
      if (start >= this.length) {
         return "";
      }
      let blob = this.file.slice(start, start + this.PAGE_SIZE);

      this.reader.readAsText(blob);

      return new Promise<boolean>(resolve => {
         self.reader.onloadend = (evt) => {
            if (evt.target["readyState"] === FileReader.prototype.DONE) { // DONE == 2
               // console.log("Reading page " + this.pageNo);
               self.buffer = evt.target["result"];
               // We've finished the block get ready for the next
               resolve(true);
            }
         };
      });
   }

   hasMore() {
      return this.index + this.PAGE_SIZE * this.pageNo < this.length - 1;
   }

   async nextNonEmpty() {
      let lineBuffer = [];
      while (this.hasMore()) {
         if (!this.buffer || this.index >= this.PAGE_SIZE)  {
            await this.readPage();
         }
         let char = this.buffer[this.index++];
         if (char === "\r") {
            continue;
         }
         if (char === "\n") {
            let str = await this.next();
            if (lineBuffer.length) {
               return lineBuffer.join("");
            }
            lineBuffer = [];
         } else {
            lineBuffer.push(char);
         }
      }
      return null;
   }

   async next(): Promise<string> {
      let lineBuffer = [];
      while (this.hasMore()) {
         if (!this.buffer || this.index >= this.PAGE_SIZE)  {
            await this.readPage();
         }
         let char = this.buffer[this.index++];
         if (char === "\r") {
            continue;
         }
         if (char === "\n") {
            break;
         }
         lineBuffer.push(char);
      }
      return lineBuffer.join("");
   }
}

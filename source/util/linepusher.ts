export class LinePusher {
   private PAGE_SIZE = 1048576; // A mb at a time should be harmless
   private file: File;
   private handler: Function;
   private errorHandler: Function;
   private pages: string[];
   private pageNo: number;
   private index: number;
   private length: number;
   private lineBuffer: string[];

   constructor(file: File, handler: Function, errorHandler: Function) {
      this.file = file;
      this.length = file.size;
      this.handler = handler;
      this.errorHandler = errorHandler;
      this.pageNo = this.index = 0;
      this.lineBuffer = [];
      this.process();
   }

   private process() {
      this.readPage();
   }

   private readPage() {
      let start = this.pageNo * this.PAGE_SIZE;
      if (start >= this.length) {
         this.complete();
      }
      let reader = new FileReader();
      let blob = this.file.slice(start, start + this.PAGE_SIZE);
      reader.onloadend = (evt) => {
         if (evt.target["readyState"] === FileReader.prototype.DONE) { // DONE == 2
            let text = evt.target["result"];
            processBlock(text);
            // We've finished the block get ready for the next
            this.pageNo++;
            this.readPage();
         }
      };
      reader.readAsText(blob);

      function processBlock(text: string) {
         for (let i = 0; i < text.length; i++) {
            let char = text[this.index];
            if (char === "\r") {
               continue;
            }
            if (char === "\n") {
               this.handler(this.lineBuffer.join(""));
               this.lineBuffer = [];
               continue;
            }
            this.lineBuffer.push(text[i]);
         }
      }
   }

   private complete() {
      if (this.lineBuffer.length) {
         // flush last line
         this.handler(this.lineBuffer.join(""));
      }
      // Send null to terminate
      this.handler(null);
   }
}

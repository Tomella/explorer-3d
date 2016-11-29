export class LineReader {
   private data: string;
   public length: number;
   private index: number;
   private bookmark: number;
   private indexStack: number[] = [];

   constructor(data: string) {
      this.data = data;
      this.length = data.length;
      this.index = 0;
   }

   hasMore() {
      return this.index < this.length - 1;
   }

   peek() {
      let str = this.next();
      this.previous();
   }

   previous() {
      if (this.indexStack.length) {
         this.index = this.indexStack.pop();
      }
   }

   next() {
      this.indexStack.push(this.index);
      let response: any[] = [];
      for (; this.index < this.length; this.index++ ) {
         let char = this.data[this.index];
         if (char === "\r") {
            continue;
         }
         if (char === "\n") {
            this.index++;
            break;
         }
         response.push(this.data[this.index]);
      }
      return !response ? null : response.join("");
   }

   expects(startsWith: string) {
      while (this.hasMore()) {
         let read = this.next();
         if (!read.indexOf(startsWith)) {
            return read;
         }
      }
      return null;
   }

   nextNonEmpty() {
      while (this.hasMore()) {
         let str = this.next();
         if (str) {
            return str;
         }
      }
      return null;
   }

   nextDataLine() {
      let line = this.nextNonEmpty();
      while (line) {
         if (line.indexOf("#")) {
            return line;
         }
         line = this.nextNonEmpty();
      }
      return line;
   }
}
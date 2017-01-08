import { LineStreamer } from "./linestreamer";

export class LineBufferedReader {
   private streamer: LineStreamer;
   private useLast: boolean;
   private current: string;

   constructor(file: File) {
      this.streamer = new LineStreamer(file);
      this.current = "";
   }

   hasMore() {
      return this.streamer.hasMore();
   }

   async previous() {
      this.useLast = true;
   }

   async next() {
      if (this.useLast) {
         this.useLast = false;
         return this.current;
      }

      this.current = await this.streamer.next();

      return this.current;
   }

   async expects(startsWith: string) {
      while (this.hasMore()) {
         let read = await this.next();
         if (!read.indexOf(startsWith)) {
            return read;
         }
      }
      return null;
   }

   async nextNonEmpty() {
      while (this.hasMore()) {
         let str = await this.next();
         if (str) {
            return str;
         }
      }
      return null;
   }

   async nextDataLine() {
      let line = await this.nextNonEmpty();
      while (line) {
         if (line.indexOf("#")) {
            return line;
         }
         line = await this.nextNonEmpty();
      }
      return line;
   }
}
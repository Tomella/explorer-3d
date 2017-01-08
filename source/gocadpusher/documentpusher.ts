import { Pusher } from "./pusher";
import { TypeFactoryPusher } from "./typefactorypusher";
import { Document } from "../gocad/document";

export class DocumentPusher extends Pusher<Document> {
   document: Document;
   complete: boolean;
   typefactorypusher: TypeFactoryPusher;

   constructor(public projectionFn?: Function) {
      super();
      this.document = new Document();
      this.typefactorypusher = new TypeFactoryPusher(this.projectionFn);
   }

   get obj() {
      return this.document;
   }

   push(line: string): boolean {
      let consumed = this.typefactorypusher.push(line);
      // Well behaved children will have changed state when not consuming so *shouldn't* get in an infinite loop.
      if (!consumed) {
         console.log("NOT PUSHED: " + line);
         this.push(line);
         // Just in case they don't behave we'll swallow it.
         return true;
      }

      if (this.typefactorypusher.complete) {
         this.complete = true;
         this.document.types.push(this.typefactorypusher.obj);
         this.typefactorypusher = new TypeFactoryPusher(this.projectionFn);
      }
      return true;
   }
}

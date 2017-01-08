import { Type } from "./type";

export class Document {
   public types: Type[];
   public version: String;

   constructor() {
      this.types = [];
   }
}

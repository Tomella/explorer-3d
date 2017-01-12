import { Type } from "./type";
import { Document } from "../domain/document";

export class GocadDocument extends Document {
   public types: Type[];
   public version: String;

   constructor() {
      super();
      this.types = [];
   }
}

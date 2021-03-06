import { Pusher } from "./pusher";
import { Event } from "../domain/event";
import { EventNames } from "./eventnames";
import { Type } from "../gocad/type";
import { TSurfPusher } from "./tsurfpusher";
import { PLinePusher } from "./plinepusher";
import { TSolidPusher } from "./tsolidpusher";
import { VSetPusher } from "./vsetpusher";
import { UnknownPusher } from "./unknownpusher";
import { TypeFactory } from "../gocad/typefactory";
import { Logger } from "../util/logger";

export class TypeFactoryPusher extends Pusher<Type> {
   typeFactory: TypeFactory;
   type: Pusher<any>;

   constructor(public projectionFn?: Function) {
      super();
      this.typeFactory = new TypeFactory();
   }

   get obj(): Type {
      return this.type.obj;
   }

   push(line: string): boolean {
      let accepted = true;
      if (this.type) {
         accepted = this.type.push(line);
         this.complete = this.type.complete;
      } else {
         accepted = this.create(line);
      }
      return accepted;
   }

   private create(line: string): boolean {
      line = line.trim();
      let parts: string[] = line.split(/\s+/g);
      this.typeFactory.isValid = parts.length === 3
            && parts[0] === "GOCAD"
            && (parts[2] === "1.0" || parts[2] === "1");

      if (this.typeFactory.isValid) {
         this.typeFactory.version = parts[2];
         if (parts[1] === "TSurf") {
            this.type = new TSurfPusher(this.projectionFn);
         } else if (parts[1] === "PLine") {
            this.type = new PLinePusher(this.projectionFn);
         } else if (parts[1] === "TSolid") {
            this.type = new TSolidPusher(this.projectionFn);
         } else if (parts[1] === "VSet") {
            this.type = new VSetPusher(this.projectionFn);
         } else {
            this.type = new UnknownPusher(this.projectionFn);
         }
      }

      let self = this;

      EventNames.names.forEach(name => this.type.addEventListener(name, eventHandler));

      return this.typeFactory.isValid;

      function eventHandler(event: Event) {
         Logger.log("TFP: " + event.type);
         self.dispatchEvent(event);
      }
   }
}
import { Document } from "../domain/document";
import { Pipeline } from "./pipeline";
import { TSurf } from "../gocad/tsurf";
import { PLineToLineSegments } from "./plinetolinesegment";
import { TSurfToMesh } from "./tsurftomesh";
import { VSetToPoints } from "./vsettopoints";
import { UnknownSink } from "./unknownsink";
import { Event } from "../domain/event";
import { BoxFactory } from "../factory/boxfactory";

enum State {
   Empty,
   Loading
};

export class PipeToThreedObj extends Pipeline {
   state: any;
   next: Pipeline;

   constructor() {
      super();
      this.state = State.Empty;
   }

   pipe(event: any): void {
      switch (this.state) {
         case State.Empty:
            this.pipeHeader(event);
            break;
         case State.Loading:
            this.next.pipe(event);
      }
   }

   private pipeHeader(event: any) {
      switch (event.eventName) {
         case "start":
            break;
         case "header":
            let data = event.data;

            switch (data.type) {
               case "TSurf":
                  this.next = new TSurfToMesh();
                  break;
               case "PLine":
                  this.next = new PLineToLineSegments();
                  break;
               case "VSet":
                  this.next = new VSetToPoints();
                  break;
               default:
                  this.next = new UnknownSink();
            }

            this.next.addEventListener("complete", this.onEvent);
            this.next.addEventListener("error", this.onEvent);
            this.next.pipe(event);
            this.state = State.Loading;
      }
   }

   destroy() {
      if (this.state === State.Loading) {
         this.next.destroy();
         this.state = State.Empty;
         this.next = null;
         super.destroy();
      }
   }
   /**
    * We only have two events, error and complete and the result is much the same.
    * * Clean up,
    * * Bubble up.
    */
   onEvent = (event: Event) => {
      let bubble = event;
      if (event.type === "complete") {
         bubble = new Event("complete", event.data);
      }
      this.dispatchEvent(bubble);
      this.destroy();
   }
}

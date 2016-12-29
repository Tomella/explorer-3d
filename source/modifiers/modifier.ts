import { EventDispatcher } from "../util/eventdispatcher";

export abstract class Modifier {
   protected world;
   private callbacks: Function[] = [];

   constructor (public eventdispatcher: EventDispatcher) {
      eventdispatcher.addEventListener("world.created", (event) => {
         this.world = event.world;
         this.flushCallbacks(event.world);
      });

      eventdispatcher.addEventListener("world.destroyed", (event) => {
         this.world = null;
         this.flushCallbacks(null);
      });
   }

   private flushCallbacks(world) {
      if (this.callbacks) {
         this.callbacks.forEach(fn => {
            fn(world);
         });
         this.callbacks = [];
      }
   }

   onChange (callback) {
      setTimeout(() => callback(this.world));
      this.callbacks.push(callback);
      return this;
   }
}
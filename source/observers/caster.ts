import { EventDispatcher } from "../util/eventdispatcher";

export class Caster {
   protected factory;
   private callbacks: Function[] = [];

   constructor (public eventdispatcher: EventDispatcher) {

      eventdispatcher.addEventListener("world.created", (event) => {
         this.factory = event.factory;
         this.flushCallbacks(event.factory);
      });

      eventdispatcher.addEventListener("world.destroyed", (event) => {
         this.factory = null;
         this.flushCallbacks(null);
      });
   }

   private flushCallbacks(factory) {
      if (this.callbacks) {
         this.callbacks.forEach(fn => {
            fn(factory);
         });
         this.callbacks = [];
      }
   }

   onChange (callback) {
      setTimeout(() => callback(this.factory));
      this.callbacks.push(callback);
      return this;
   }
}
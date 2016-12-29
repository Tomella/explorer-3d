import { EventDispatcher } from "../util/eventdispatcher";

export class VerticalExagerate {
   private world;
   private callbacks: Function[] = [];

   constructor (public eventdispatcher: EventDispatcher) {
      eventdispatcher.addEventListener('world.created', (event) => {
         console.log("world created");
         console.log(event);
         this.world = event.world;
         this.flushCallbacks();
      });
   }

   private flushCallbacks() {
      if(this.callbacks) {
         this.callbacks.forEach(fn => {
            fn(this.world);
         });
         this.callbacks = [];
      }
   }

   onReady (callback) {
      if(this.world) {
         callback(this.world);
      } else {
        this.callbacks.push(callback);
      }
      return this;
   }

   set (value) {
      this.world.dataContainer.scale.z = value;
   }

   get () {
      return this.world.dataContainer.scale.z;
   }
}
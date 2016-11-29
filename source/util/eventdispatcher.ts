/**
 * https://github.com/mrdoob/eventdispatcher.js/
 */
export class EventDispatcher {
   private _listeners: any;

   constructor() { }

   public apply(object: any) {
      object.addEventListener = EventDispatcher.prototype.addEventListener;
      object.hasEventListener = EventDispatcher.prototype.hasEventListener;
      object.removeEventListener = EventDispatcher.prototype.removeEventListener;
      object.dispatchEvent = EventDispatcher.prototype.dispatchEvent;
   }

   public addEventListener(type: string, listener: Function) {
      if (this._listeners === undefined) this._listeners = {};

      let listeners = this._listeners;

      if (listeners[type] === undefined) {
         listeners[type] = [];
      }

      if (listeners[type].indexOf(listener) === - 1) {
         listeners[type].push(listener);
      }
   }

   public hasEventListener(type: string, listener: Function) {
      if (this._listeners === undefined) return false;

      let listeners = this._listeners;

      if (listeners[type] !== undefined && listeners[type].indexOf(listener) !== - 1) {
         return true;
      }
      return false;
   }

   public removeEventListener(type: string, listener: Function) {
      if (this._listeners === undefined) return;

      let listeners = this._listeners;
      let listenerArray = listeners[type];

      if (listenerArray !== undefined) {
         let index = listenerArray.indexOf(listener);

         if (index !== - 1) {
            listenerArray.splice(index, 1);
         }
      }
   }

   public dispatchEvent() {
      let array: any[] = [];
      return;

      function fn(event: any) {
         if (this._listeners === undefined) return;
         let listeners = this._listeners;
         let listenerArray = listeners[event.type];
         if (listenerArray !== undefined) {
            event.target = this;
            let length = listenerArray.length;
            for (let i = 0; i < length; i++) {
               array[i] = listenerArray[i];
            }
            for (let i = 0; i < length; i++) {
               array[i].call(this, event);
            }
         }
      }
   }
}
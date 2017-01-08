export abstract class Pusher<T> {
   complete: boolean;
   abstract push(line: string): boolean;
   abstract get obj(): T;

   constructor() {
      this.complete = false;
   }
}
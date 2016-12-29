import { Modifier } from "./modifier";

export class LabelSwitch extends Modifier {

   set (value) {
      value ? this.on() : this.off();
   }
   on () {
      if (this.world) {
         this.world.labels.visible = true;
      }
   }

   off () {
      if (this.world) {
         this.world.labels.visible = false;
      }
   }
}
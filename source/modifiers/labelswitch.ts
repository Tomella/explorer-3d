import { Modifier } from "./modifier";

export class LabelSwitch extends Modifier {

   set (value) {
      value ? this.on() : this.off();
   }
   on () {
      if (this.factory && this.factory.getWorld()) {
         this.factory.getWorld().labels.visible = true;
      }
   }

   off () {
      if (this.factory && this.factory.getWorld()) {
         this.factory.getWorld().labels.visible = false;
      }
   }
}
import { Modifier } from "./modifier";

export class LabelSwitch extends Modifier {
   set (value) {
      if (this.factory && this.factory.getWorld()) {
         this.factory.getWorld().labels.visible = value;
      }
   }
}
import { Modifier } from "./modifier";

export class VerticalExagerate extends Modifier {

   set (value) {
      if (this.factory && this.factory.getWorld()) {
         this.factory.getWorld().dataContainer.scale.z = value;
      }
   }
}
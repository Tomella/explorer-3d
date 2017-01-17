import { Modifier } from "./modifier";

export class VerticalExaggerate extends Modifier {

   set (value) {
      if (this.factory && this.factory.getWorld()) {
         this.factory.getWorld().dataContainer.scale.z = value;
      }
   }
}
import { Modifier } from "./modifier";

export class VerticalExagerate extends Modifier {

   set (value) {
      if (this.world) {
         this.world.dataContainer.scale.z = value;
      }
   }
}
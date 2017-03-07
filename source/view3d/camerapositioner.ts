export class CameraPositioner {
   constructor() {
   }

   onCreate(z: number, radius: number, center: { x, y, z }) {
      return {
         far: this.far(z, radius, center),
         near: this.near(z, radius, center),
         up: this.up(z, radius, center),
         position: this.position(z, radius, center),
         lookAt: this.lookAt(z, radius, center)
      };
   }

   onResize(z: number, radius: number, center: { x, y, z }) {
      return {
         far: this.far(z, radius, center),
         near: this.near(z, radius, center),
         lookAt: this.lookAt(z, radius, center)
      };
   }

   onExtend(z: number, radius: number, center: { x, y, z }) {
      return this.onCreate(z, radius, center);
   }

   lookAt(z: number, radius: number, center: { x, y, z }) {
      return {
         x: center.x,
         y: center.y,
         z: center.z
      };
   }

   position(z: number, radius: number, center: { x, y, z }) {
      return {
         x: center.x,
         y: center.y - 3 * radius,
         z: center.z + radius
      };
   }

   up(z: number, radius: number, center: { x, y, z }) {
      return {
         x: 0,
         y: 0,
         z: 1
      };
   }

   near(z: number, radius: number, center: { x, y, z }) {
      return radius * 0.01;
   }

   far(z: number, radius: number, center: { x, y, z }) {
      return z * 250;
   }
}

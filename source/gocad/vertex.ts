export class Vertex {
   public x: number;
   public y: number;
   public z: number;

   constructor(str: string, projectionFn: Function) {
      if (str) {
         let parts = str.split(/\s+/g);
         let coords = projectionFn([parseFloat(parts[0]), parseFloat(parts[1])]);
         this.x = coords[0];
         this.y = coords[1];
         this.z = parseFloat(parts[2]);
      }
   }
}
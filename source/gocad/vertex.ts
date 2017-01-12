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

export function vertex(vrtx: string, projectionFn: Function, zDirection?: number) {
   let parts = vrtx.split(/\s+/g);
   let length = parts.length;
   let zSign = zDirection ? zDirection : 1;
   let coord: number[] = [];

   let response: any = {
      get xyz() {
         return [this.x, this.y, this.z];
      },
      get all() {
         let data = [this.x, this.y, this.z];
         if (this.properties) {
            this.properties.forEach((item: any) => {
               data.push(item);
            });
         }
         return data;
      }
   };

   parts.forEach((item, i) => {
      switch (i) {
         case 0: break;
         case 1:
            response.index = +item - 1;
            break;
         case 2:
            coord[0] = +item;
            // response.x = parseFloat(item);
            break;
         case 3:
            coord[1] = +item;
            // response.y = parseFloat(item);
            break;
         case 4:
            response.z = +item * zSign;
            break;
         case 5:
            response.properties = [];
         // Fall through to populate
         default:
            response.properties.push(item);
      }
   });
   if (projectionFn) {
      coord = projectionFn(coord);
   }
   response.x = coord[0];
   response.y = coord[1];
   return response;
}
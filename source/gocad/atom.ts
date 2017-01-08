export function atom(atm: string) {
   let parts = atm.split(/\s+/g);
   let length = parts.length;
   let response: any = {
      get xyz() {
         return [this.x, this.y, this.z];
      }
   };

   parts.forEach((item, i) => {
      switch (i) {
         case 0: break;
         case 1:
            response.index = parseInt(item) - 1;
            break;
         case 2:
            response.vertexId = parseFloat(item) - 1;
            break;
         case 3:
            response.properties = [];
         // Fall through to populate
         default:
            response.properties.push(item);
      }
   });
   return response;
}

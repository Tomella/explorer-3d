// We are zero based, GoCad is 1 based
export function face(face: string) {
   let parts = face.split(/\s+/g);
   let length = parts.length;
   let response: any = {
      get abc() {
         return [this.a, this.b, this.c];
      }
   };

   if (length === 4) {
      response.a = parseInt(parts[1]) - 1;
      response.b = parseFloat(parts[2]) - 1;
      response.c = parseFloat(parts[3]) - 1;
   }
   return response;
}
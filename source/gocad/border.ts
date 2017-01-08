export function border(border: string) {
   let parts = border.split(/\s+/g);
   return {
      id: +parts[1] - 1,
      vertices: [
         +parts[2] - 1,
         +parts[3] - 1
      ]
   };
}

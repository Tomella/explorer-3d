export function tetra(tetra: string): number[] {
   let parts = tetra.split(/\s+/g);
   return [
      parseInt(parts[1]),
      parseInt(parts[2]),
      parseInt(parts[3]),
      parseInt(parts[4])
   ];
}

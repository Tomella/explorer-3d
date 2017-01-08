export function segment(seg: string): number[] {
   let parts = seg.split(/\s+/g);
   return [
      parseInt(parts[1]) - 1,
      parseInt(parts[2]) - 1
   ];
}
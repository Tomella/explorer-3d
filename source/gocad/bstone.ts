export function bstone(bstone: string) {
   let parts = bstone.split(/\s+/g);
   return parseInt(parts[1]) - 1;
}

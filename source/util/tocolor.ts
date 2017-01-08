export function toColor(val: string): number {
   if (val) {
      let parts = val.trim().split(/\s+/g);
      if (parts.length === 1) {
         if (parts[0].indexOf("#") === 0) {
            return parseInt("0x" + parts[0].substring(1));
         }
      }
      return parseFloat(parts[0]) * 255 * 256 * 256 + parseFloat(parts[1]) * 255 * 256 + parseFloat(parts[2]) * 255;
   }
   return null;
}
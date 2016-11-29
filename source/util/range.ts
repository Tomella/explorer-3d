
export function range(array: any[], cb: Function) {
   let i = -1,
      length = array.length,
      min: number,
      value: number,
      max: number;

   if (cb == null) {
      while (++i < length) {
         if ((value = array[i]) != null && value >= value) {
            min = max = value;
            break;
         }
      }
      while (++i < length) {
         if ((value = array[i]) != null) {
            min = Math.min(min, value);
            max = Math.max(max, value);
         }
      }
   } else {
      while (++i < length) {
         if ((value = cb(array[i], i, array)) != null && value >= value) {
            min = max = value;
            break;
         }
      }
      while (++i < length) {
         if ((value = cb(array[i], i, array)) != null) {
            min = Math.min(min, value);
            max = Math.max(max, value);
         }
      }
   }
   return [min, max];
}


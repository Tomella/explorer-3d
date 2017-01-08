export function deepMerge(target: any, source: any) {
   let array = Array.isArray(source);
   let dst: any = array && [] || {};

   if (Array.isArray(source)) {
      let dest: any[] = <[any]>dst;
      target = target || [];
      dest = dest.concat(target);
      source.forEach(function (item: any, i: number) {
         if (typeof dest[i] === "undefined") {
            dest[i] = item;
         } else if (typeof item === "object") {
            dest[i] = deepMerge(target[i], item);
         } else {
            if (target.indexOf(item) === -1) {
               dest.push(item);
            }
         }
      });
   } else {
      if (target && typeof target === "object") {
         Object.keys(target).forEach(function (key) {
            dst[key] = target[key];
         });
      }
      Object.keys(source).forEach(function (key) {
         if (typeof source[key] !== "object" || !source[key]) {
            dst[key] = source[key];
         } else {
            if (!target[key]) {
               dst[key] = source[key];
            } else {
               dst[key] = deepMerge(target[key], source[key]);
            }
         }
      });
   }
   return dst;
}

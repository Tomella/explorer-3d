export class CoordinateSystem {
   public isValid: boolean = true;
   public typeMap = {
      AXIS_NAME: split,
      AXIS_UNIT: split
   };
}

function split(val: string): string[] {
   return val.split(/\s+/g).map(function (str: string) {
      return str.replace(/\"/g, "");
   });
}
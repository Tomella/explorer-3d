import { Parser } from "./parser";
import { Logger } from "../util/Logger";
import { CswElevationPointsParser } from "../elevation3js/cswelevationpointsparser";

export class ElevationParser extends Parser {

   constructor(public options: any = {}) {
      super();
   }

   public parse(data: any): Promise<any> {
      return new CswElevationPointsParser(this.options).parse();
   }
}
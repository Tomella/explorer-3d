import { Parser } from "./parser";
import { Logger } from "../util/Logger";
import { WcsElevationPointsParser } from "../elevation3js/wcselevationpointsparser";
import { WcsElevationSurfaceParser } from "../elevation3js/wcselevationsurfaceparser";
import { WcsWmsSurfaceParser } from "../elevation3js/wcswmssurfaceparser";

import { WcsCanvasSurfaceParser } from "../elevation3js/wcscanvassurfaceparser";

export class ElevationParser extends Parser {

   constructor(public options: any = {}) {
      super();
   }

   public parse(data: any): Promise<any> {
      if (this.options.surface) {
         return new WcsElevationSurfaceParser(this.options).parse();
      } else if (this.options.wmsSurface) {
         return new WcsCanvasSurfaceParser(this.options).parse();
      }

      return new WcsElevationPointsParser(this.options).parse();
   }
}
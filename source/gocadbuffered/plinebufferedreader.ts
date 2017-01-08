import { atom } from "../gocad/atom";
import { segment } from "../gocad/segment";
import { vertex } from "../gocad/vertex";
import { LineBufferedReader } from "../util/linebufferedreader";
import { CoordinateSystemBufferedReader } from "./coordinatesystembufferedreader";
import { PLineHeader } from "../gocad/plineheader";
import { PLineHeaderBufferedReader } from "./plineheaderbufferedreader";
import { PLine } from "../gocad/pline";
import { TypeBufferedReader } from "./typebufferedreader";

export class PLineBufferedReader extends TypeBufferedReader  {

   /**
    * We come in here on the next line
    */
   constructor(reader: LineBufferedReader, projectionFn?: Function) {
      super(reader, projectionFn);
   }

   async read(): Promise<PLine> {
      let pline = new PLine();

      let line: string = await this.reader.expects("HEADER");
      if (!line || line.indexOf("{") === -1) {
         return pline;
      }

      let header = await  new PLineHeaderBufferedReader(this.reader).read();
      pline.header = header;

      let cs = await new CoordinateSystemBufferedReader(this.reader).read();

      let zSign = 1;
      if (cs.isValid) {
         pline.coordinateSystem = cs;
         zSign = pline.coordinateSystem["ZPOSITIVE"] === "Depth" ? -1 : 1;
      }
      // let props = new Properties(reader);
      // if(props.isValid) {
      //   this.properties = props;
      // }

      line = await this.reader.expects("ILINE");
      let startIndex = 1;
      let lastIndex = 1;
      let hasSeg = false;
      let lineSegments: number[][] = [];
      line = await this.reader.nextDataLine();
      let completed = (line ? line.trim() : "}") === "}";
      while (!completed) {
         if (line.indexOf("VRTX") === 0 || line.indexOf("PVRTX") === 0) {
            let v = vertex(line, this.projectionFn, zSign);
            pline.vertices[v.index] = v.all;
            lastIndex = v.index;
         } else if (line.indexOf("ATOM") === 0 || line.indexOf("PATOM") === 0) {
            let a = atom(line);
            pline.vertices[a.index] = pline.vertices[a.vertexId];
         } else if (line.indexOf("SEG") === 0) {
            lineSegments.push(segment(line));
            hasSeg = true;
         } else if (line.indexOf("ILINE") === 0 || line.indexOf("END") === 0) {
            completed = line.indexOf("END") === 0;
            if (!hasSeg && lastIndex > startIndex) {
               // We have to step over every vertex pair from start index to lastIndex
               for (let i = startIndex; i < lastIndex; i++) {
                  lineSegments.push([i, i + 1]);
               }
            }
            pline.lines.push(lineSegments);
            lineSegments = [];
            startIndex = lastIndex + 1;
            hasSeg = false;
         }
         completed = !this.reader.hasMore();
         if (!completed) {
            line = (await this.reader.nextDataLine()).trim();
            completed = line === "}";
         }
      }

      return pline;
   }
}
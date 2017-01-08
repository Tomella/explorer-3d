import { TSurfBufferedReader } from "./tsurfbufferedreader";
import { PLineBufferedReader } from "./plinebufferedreader";
import { TSolidBufferedReader } from "./tsolidbufferedreader";
import { VSetBufferedReader } from "./vsetbufferedreader";
import { UnknownBufferedReader } from "./unknownbufferedreader";
import { LineBufferedReader } from "../util/linebufferedreader";
import { TypeFactory } from "../gocad/typefactory";

export class TypeFactoryBufferedReader {

   constructor(public reader: LineBufferedReader, public projectionFn?: Function) {
   }

   async read(): Promise<TypeFactory> {
      let typeFactory = new TypeFactory();
      if (this.reader.hasMore()) {
         let line: string = (await this.reader.next()).trim();
         let parts: string[] = line.split(/\s+/g);
         typeFactory.isValid = parts.length === 3
            && parts[0] === "GOCAD"
            && (parts[2] === "1.0" || parts[2] === "1");

         if (typeFactory.isValid) {
            typeFactory.version = parts[2];
            if (parts[1] === "TSurf") {
               typeFactory.type = await new TSurfBufferedReader(this.reader, this.projectionFn).read();
            } else if (parts[1] === "PLine") {
               typeFactory.type = await new PLineBufferedReader(this.reader, this.projectionFn).read();
            } else if (parts[1] === "TSolid") {
               typeFactory.type = await new TSolidBufferedReader(this.reader, this.projectionFn).read();
            } else if (parts[1] === "VSet") {
               typeFactory.type = await new VSetBufferedReader(this.reader, this.projectionFn).read();
            } else {
               typeFactory.type = await new UnknownBufferedReader(this.reader, this.projectionFn).read();
            }
         }
      }
      return typeFactory;
   }
}
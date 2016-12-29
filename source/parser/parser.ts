export abstract class Parser {
   static workerBase = "";

   public getBase(): string {
      return Parser.workerBase;
   }

   abstract parse(file: File, options: any): Promise<any>;
}
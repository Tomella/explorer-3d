export abstract class Parser {
   static codeBase = "";

   public getWorkersBase(): string {
      return Parser.codeBase + "/workers/";
   }

   abstract parse(file: File, options: any): Promise<any>;
}
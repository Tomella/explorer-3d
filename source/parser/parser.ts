import { EventDispatcher } from "../util/eventdispatcher";

export abstract class Parser extends EventDispatcher {
   static codeBase = "";

   public getWorkersBase(): string {
      return Parser.codeBase + "/workers/";
   }

   abstract parse(file: File, options: any): Promise<any>;
}
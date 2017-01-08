import { Parser } from "./parser";

/**
 * Use as a wrapper around other parsers to limit the number of concurrent web workers.
 * The constructor takes the wrapped parser and an optional count of web workers.
 * The default count is 7 as that means you get roughly 100% peak CPU use on an
 * 8 core CPU as the UI is using one core.
 */
export class ThrottleProxyParser extends Parser {
   stack: any[];
   count: number;

   constructor(public parser: Parser, public max: number = 7) {
      super();
      this.stack = [];
      this.count = 0;
   }

   parse(file: File, options: any): Promise<any> {
      let self = this;
      let waiter: any = {
         timestamp: Date.now(),
         file,
         options,
         self
      };

      let promise = new Promise<any>(resolve => {
         waiter.resolver = resolve;
      });

      this.stack.push(waiter);

      this.count++;
      checkJobs();
      runCleaner();

      return promise;

      function runCleaner() {

      }

      function checkJobs() {
         console.log("We have " + self.count + " jobs queued");
         if (self.count > self.max || self.count < 1) {
            return;
         }
         runJob();
      }

      function runJob() {
         console.log("Jobs length = " + self.count);
         let job = self.stack.shift();
         if (job) {
            job.self.parser.parse(job.file, job.options).then(response => {
               decrementCount();
               runJob();
               job.resolver(response);
            }).catch(err => {
               console.log("Ooops!");
               console.log(err);
               decrementCount();
            });
         }
      }

      function decrementCount() {
         if (self.count > 0) {
            self.count--;
         }
      }
   }
}
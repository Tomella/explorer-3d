export class LinesToLinePusher {

   constructor(public callback: Function) {
   }

   receiver(lines: string[]) {
      let self = this;

      lines.forEach(line => {
         self.callback(line);
      });
   }

}
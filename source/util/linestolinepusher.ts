export class LinesToLinePusher {

   constructor(public callback: Function) {
   }

   receiver(lines: string[]) {
      lines.forEach(line => {
         this.callback(line);
      });
   }
}
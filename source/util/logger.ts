export class Logger {
   static LOG_ALL = 64;
   static LOG_INFO = 32;
   static LOG_WARN = 16;
   static LOG_ERROR = 8;
   static LOG_NOTHING = 0;
   private static _broken = false;

   static noop() {};

   static log: Function = Logger.noop;
   static error: Function = Logger.noop;
   static info: Function = Logger.noop;
   static warn: Function = Logger.noop;

   static set level(value) {
      let num = parseInt(value);
      num = num === NaN ? 0 : num;
      if (!Logger._broken) {
         Logger.log = console.log;
         try {
            Logger.log("Setting log level");
         } catch (e) {
            Logger._broken = true;
         }
      }

      if (Logger._broken) {
         Logger.log = num >= 64 ? function() { console.log(...arguments); } : Logger.noop;
         Logger.info = num >= 32 ? function() { console.info(...arguments); } : Logger.noop;
         Logger.warn = num >= 16 ? function() { console.warn(...arguments); } : Logger.noop;
         Logger.log = num >= 8 ? function() { console.log(...arguments); } : Logger.noop;
      } else {
         // We get to keep line numbers if we do it this way.
         Logger.log = num >= 64 ? console.log : Logger.noop;
         Logger.info = num >= 32 ? console.info : Logger.noop;
         Logger.warn = num >= 16 ? console.warn : Logger.noop;
         Logger.error = num >= 8 ? console.error : Logger.noop;
      }
   }
}
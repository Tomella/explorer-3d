export class Logger {
   static _level: number = 0;
   static LOG_ALL = 64;
   static LOG_INFO = 32;
   static LOG_WARN = 16;
   static LOG_ERROR = 8;
   static LOG_NOTHING = 0;

   static set level(value) {
      let num = parseInt(value);
      num = num === NaN ? 0 : num;
      Logger._level = num;
   }

   static log(line, obj) {
      if (Logger._level >= Logger.LOG_ALL) {
         Logger._log(line, obj);
      }
   }

   static error(line, obj) {
      if (Logger._level >= Logger.LOG_ERROR) {
         Logger._log("ERROR: " + line, obj);
      }
   }

   static info(line, obj) {
      if (Logger._level >= Logger.LOG_INFO) {
         Logger._log("INFO: " + line, obj);
      }
   }

   static warn(line, obj) {
      if (Logger._level >= Logger.LOG_WARN) {
         Logger._log("WARN: " + line, obj);
      }
   }

   static private _log(line, obj?) {
      if (obj) {
         console.log(line, obj);
      } else {
         console.log(line);
      }
   }
}
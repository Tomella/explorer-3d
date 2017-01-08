importScripts('../resources/polyfills.js',
   '../libs.js',
   '../resources/proj4.js');

(function(context) {
   context.addEventListener('message', function(e) {
      var t = Date.now();
      Explorer3d.fileReader(e, proj4).then(document => {
         var n = Date.now();
         if(document) {
            console.log("Processed document in " + (n - t)/1000 + " s");
            context.postMessage(document);
         } else {
            context.postMessage({});
         }
         console.log("Proces finished in " + (Date.now() - t)/1000 + " s");
         context.close()
      });
   }, false);

})(this);
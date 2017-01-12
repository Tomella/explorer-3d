importScripts('../resources/polyfills.js',
   '../libs.js',
   '../resources/proj4.js');

(function(context) {
   context.addEventListener('message', function(e) {
      var t = Date.now();
      Explorer3d.fileBufferedReader(e, proj4).then(document => {
         var n = Date.now();
         if(document) {
            console.log("Processed document in " + (n - t)/1000 + " s");
            context.postMessage(JSON.stringify(document));
         } else {
            context.postMessage("{}");
         }
         console.log("Proces finished in " + (Date.now() - t)/1000 + " s");
         context.close()
      }).catch(function(err) {
         console.error("We failed in the gocad stream");
         console.error(err);
      });
   }, false);

})(this);
importScripts('../resources/polyfills.js',
   '../libs.js',
   '../resources/proj4.js');

(function (context) {
   context.addEventListener('message', function (e) {
      var t = Date.now();
      var pusher = new Explorer3d.FilePusher(e.data.file, e.data.options, proj4).start().then(document => {
         var n = Date.now();
         if (document) {
            console.log("Processed document in " + (n - t) / 1000 + " s");
            context.postMessage(document);
         } else {
            console.warn("Where is the document?");
            context.postMessage({});
         }
         console.log("Process finished in " + (Date.now() - t) / 1000 + " s");
         context.close();
      }).catch(err => {
         console.warn("Where is the document?");
         console.warn(err);
         context.postMessage({});
         context.close();
      });


   }, false);

})(this);
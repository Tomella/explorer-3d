(function (global, Explorer3d) {
   // Keep all the DOM stuff together. Make the abstraction to the HTML here
   var dom = {
      verticalExageration: document.getElementById("exagerate"),
      fileDrop: document.getElementById("fileDrop"),
      target: document.getElementById("target"),
      projection: {
         get from() {
            return document.getElementById("projectFrom").value;
         },
         get to() {
            return document.getElementById("projectTo").value;
         }
      }
   };

   // Grab ourselves a world factory
   var factory = new Explorer3d.DefaultWorldFactory();

   // Set where we are going to put the view
   factory.element = dom.target;

   // Where are my workers? Just above here in this case. We have mapped the dependency in /dist. It's base is relative to the HTML page.
   Explorer3d.Parser.workerBase = "../dist/workers/";

   // You could lazy load these. I nearly did. I would if it was part of a bigger app.
   let geojsonParser = new Explorer3d.GeoJsonParser(),
      gocadParser = new Explorer3d.GocadParser();

   // Add a listener to the file drop area. Just keep
   let fileDrop = new Explorer3d.FileDrop(dom.fileDrop, function handler(file) {
      var options = {
         from: dom.projection.from,
         to:   dom.projection.to
      };
      var promise;

      if (file.name.indexOf(".json") > 0) {
         promise = geojsonParser.parse({ file: file, options: options });
      } else {
         promise = gocadParser.parse({ file: file, options: options });
      }
      promise.then(data => {
         world = factory.show(Explorer3d.Transformer.transform(data));
      });
   });

   // We'll attach something to change vertical exageration now.
   var verticalExagerate= new Explorer3d.VerticalExagerate(factory).onReady(world => {
      console.log("Ready");
      verticalExagerate.set(+dom.verticalExageration.value);
      dom.verticalExageration.addEventListener("change", (event) => {
         verticalExagerate.set(+dom.verticalExageration.value);
      });
   });


})(window, Explorer3d)
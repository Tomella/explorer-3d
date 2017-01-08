(function (global, Explorer3d) {
   // Keep all the DOM stuff together. Make the abstraction to the HTML here
   var dom = {
      verticalExageration: document.getElementById("exagerate"),
      selfDestruct: document.getElementById("selfDestruct"),
      labelSwitch: document.getElementById("labelSwitch"),
      objectsList: document.getElementById("objectsList"),
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
   var factory = new Explorer3d.DefaultWorldFactory(dom.target);

   // Where are my workers? Just above here in this case. We have mapped the dependency in /dist. It's base is relative to the HTML page.
   Explorer3d.Parser.workerBase = "../dist/workers/";

   // You could lazy load these. I nearly did. I would if it was part of a bigger app.
   let geojsonParser = new Explorer3d.GeoJsonParser(),
      // Read files at 1 MB per read.
      gocadParser = new Explorer3d.GocadPusherParser();

   // Proxy the parser(s) and throttle the threads.  You can bypass this for unbounded threads.
   // Depending how many cores you have will determine actual usage. With 8 cores the bottle nec
   gocadParser = new Explorer3d.ThrottleProxyParser(gocadParser,  3);

   // Use this one for local testing
   // gocadParser = new Explorer3d.LocalGocadPusherParser()

   // Add a listener to the file drop area.
   let fileDrop = new Explorer3d.FileDrop(dom.fileDrop, function handler(file) {
      // See if we set projections
      let options = {
         from: dom.projection.from,
         to:   dom.projection.to,
         blockSize: 1024 * 1024
      };

      let promise;
      // Arbitrate the type by extension
      if (file.name.indexOf(".json") > 0) {
         promise = geojsonParser.parse({ file: file, options: options });
      } else {
         promise = gocadParser.parse({ file: file, options: options });
      }

      // Off to the parser to do its best
      promise.then(document => {
         // We got back a document so transform and show.
         var response = factory.show(Explorer3d.Transformer.transform(document));
      });
   });

   /**
    * Some UI to keep the users happy
    */

   // We'll attach something to change vertical exageration now.
   let verticalExagerate = new Explorer3d.VerticalExagerate(factory).onChange(() => {
      verticalExagerate.set(+dom.verticalExageration.value);
   });
   dom.verticalExageration.addEventListener("change", () => {
      verticalExagerate.set(+dom.verticalExageration.value);
   });

   // Wire in the ability to turn labels on and off.
   var labelSwitch = new Explorer3d.LabelSwitch(factory).onChange(() => {
      labelSwitch.set(dom.labelSwitch.checked);
   });
   dom.labelSwitch.addEventListener("change", () => {
      labelSwitch.set(dom.labelSwitch.checked);
   });

   // Get a handle on children each time it changes.
   factory.addEventListener("objects.changed", (event) => {
      let count = 1;
      let target = dom.objectsList;
      target.innerHTML = "";
      target.className = "";

      // sort by center z value
      event.objects.sort((a, b) => {
         a.geometry.computeBoundingSphere();
         b.geometry.computeBoundingSphere();
         return b.geometry.boundingSphere.center.z - a.geometry.boundingSphere.center.z
      }).forEach(obj => {
         let template = document.createElement("div");
         template.className = "layer";
         let color = obj.material.color.getStyle();
         color = color ? color : "lightgray"
         template.style.backgroundColor = color;

         let button = document.createElement("button");
         let x = document.createTextNode("X");

         let span = document.createElement("span");
         span.className = "layerspan";

         let name = obj.userData.header && obj.userData.header.name ? obj.userData.header.name : ("Unknown #" + count++);
         let text = document.createTextNode(name);
         let inp = document.createElement("input");
         inp.type = "checkbox"
         inp.checked = obj.visible;
         inp.onchange = function(ev) {
            obj.visible = ev.target.checked;
         };

         button.appendChild(x);
         button.className = "crossButton";
         button.onclick = function(event) {
            factory.remove(obj);
         }

         span.appendChild(inp);
         span.appendChild(text);

         template.appendChild(span);
         template.appendChild(button);
         target.appendChild(template);
         target.className = "active";
      });
   });



   // Pretty simple. Get the factory to reset.
   dom.selfDestruct.addEventListener("click", (event) => {
      factory.destroy();
   });
})(window, Explorer3d)
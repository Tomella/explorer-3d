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
      let options = {
         from: dom.projection.from,
         to:   dom.projection.to
      };
      let promise;

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
   let verticalExagerate = new Explorer3d.VerticalExagerate(factory).onChange(world => {
      verticalExagerate.set(+dom.verticalExageration.value);
   });
   dom.verticalExageration.addEventListener("change", (event) => {
      verticalExagerate.set(+dom.verticalExageration.value);
   });

   // Wire in the ability to turn labels on and off.
   var labelSwitch = new Explorer3d.LabelSwitch(factory).onChange(world => {
      labelSwitch.set(dom.labelSwitch.checked);
   });
   dom.labelSwitch.addEventListener("change", (event) => {
      labelSwitch.set(dom.labelSwitch.checked);
   });

   // Get a handle on children each time it changes.
   factory.addEventListener("objects.changed", (event) => {
      let target = dom.objectsList;
      target.innerHTML = "";
      target.className = "";
      event.objects.forEach(obj => {
         let template = document.createElement("div");
         template.className = "layer";
         let color = obj.material.color.getStyle();
         color = color ? color : "lightgray"
         template.style.backgroundColor = color;

         let button = document.createElement("button");
         let x = document.createTextNode("X");
         let text = document.createTextNode(obj.userData.header.name);

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

         template.appendChild(inp);
         template.appendChild(text);
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
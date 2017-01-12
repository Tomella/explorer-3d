(function (global, Explorer3d) {
   /*
    * Set up some settings. Just configuration and data.
    */
   var appOptions = {
      workerCount: 7,
      browser: "modern",
      blockSize: 16 * 1024,
      hasWebGl: webgl(),
      logLevel: Explorer3d.Logger.LOG_nothing // LOG_NOTHING, LOG_ERROR, LOG_WARN, LOG_INFO, LOG_ALL. It logs nothing by default.
   };

   var refData = {
      preWebGlMessage: "Your browser is not capable of rendering 3D.\n" +
         "Try a newer browser like the latest Firefox, Edge or Chrome\n" +
         "from Mozilla, Microsoft or Google respectively.",
      ie11Warning: "Your browser is a bit old to handle big files.\n" +
         "The latest Firefox or Edge is the best for large files.\n" +
         "Chrome is OK but struggles earlier than Firefox or Edge."
   };

   if(navigator.userAgent && navigator.userAgent.indexOf("Trident/") > 0) {
      appOptions.browser = "ie11";
      appOptions.blockSize = 2 * 1024 * 1024; // IE11 struggles with big files.
      appOptions.fileSizeLimit = 20 * appOptions.blockSize; // IE11 struggles with memory allocation.
   }

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

/******************************************************************
 * Here is the calling of the API.
 ****************************************************************** */
   Explorer3d.Logger.level = appOptions.logLevel;
   // Explorer3d.Logger.log("ALL");
   // Explorer3d.Logger.info("INFO");
   // Explorer3d.Logger.warn("WARN");
   // Explorer3d.Logger.error("ERROR");

   // Grab ourselves a world factory
   var factory = new Explorer3d.DefaultWorldFactory(dom.target);

   // Where are my workers? Just above here in this case. We have mapped the dependency in /dist. It's base is relative to the HTML page.
   Explorer3d.Parser.codeBase = "../dist";

   // You could lazy load these. I nearly did. I would if it was part of a bigger app.
   let gocadParser = new Explorer3d.GocadPusherParser(appOptions);

   // Proxy the parser(s) and throttle the threads.  You can bypass this for unbounded threads.
   // Depending how many cores you have will determine actual usage. With 8 cores the bottle neck will be
   // the UI thread. That would be 7 threads funneling into 1.
   gocadParser = new Explorer3d.ThrottleProxyParser(gocadParser, appOptions.workerCount);

   // Use this one for local testing. It's much slower but its easier to debug locally rather than in a web worker.
   // gocadParser = new Explorer3d.LocalGocadPusherParser(appOptions)

   // Add a listener to the file drop area.
   let fileDrop = new Explorer3d.FileDrop(dom.fileDrop, function handler(file) {
      // What are they even trying for? No dinosaurs allowed.
      if (!appOptions.hasWebGl) {
         alert(preWebGlMessage);
         return;
      }

      if(appOptions.fileSizeLimit) {
         // While size isn't standard the only browsers we care about have it.
         if(file.size && file.size > appOptions.fileSizeLimit) {
            alert(ie11Warning);
            return;
         }
      }
      // See if we set projections
      let options = {
         from: dom.projection.from,
         to:   dom.projection.to,
         blockSize: 1024 * 1024
      };
      Object.assign(options, appOptions);

      let promise = gocadParser.parse({ file: file, options: options });

      // Off to the parser to do its best
      Explorer3d.Logger.log(seconds() + ": We have started the process.");
      promise.then(function(data) {
         if (data.eventName) {
            Explorer3d.Logger.log(data);
         } else {
            // We got back a document so transform and show.
            var response = factory.show(data);
            Explorer3d.Logger.log(seconds() + ": We have shown the document");
         }
      }).catch(function(err) {
         Explorer3d.Logger.error("We failed in the simple example");
         Explorer3d.Logger.error(err);
      });
   });

/********************************************************
 * End of calling the API. Now the UI.
 * This is just plain old HTML with no framework.
 * There are some UI helper calls provided by the API.
 ******************************************************** */

   /**
    * Some UI to keep the users happy
    */

   // We'll attach something to change vertical exageration now.
   let verticalExagerate = new Explorer3d.VerticalExagerate(factory).onChange(function() {
      Explorer3d.Logger.log("We have a trigger to vertical exagerate");
      verticalExagerate.set(+dom.verticalExageration.value);
   });
   dom.verticalExageration.addEventListener("change", function() {
      verticalExagerate.set(+dom.verticalExageration.value);
   });

   // Wire in the ability to turn labels on and off.
   var labelSwitch = new Explorer3d.LabelSwitch(factory).onChange(function() {
      labelSwitch.set(dom.labelSwitch.checked);
   });
   dom.labelSwitch.addEventListener("change", function() {
      labelSwitch.set(dom.labelSwitch.checked);
   });

   // Get a handle on children each time it changes.
   factory.addEventListener("objects.changed", function(event) {
      let count = 1;
      let target = dom.objectsList;
      target.innerHTML = "";
      target.className = "";

      // sort by center z value
      event.objects.sort(function(a, b) {
         if (!a.geometry.boundingSphere) a.geometry.computeBoundingSphere();
         if (!b.geometry.boundingSphere) b.geometry.computeBoundingSphere();
         return b.geometry.boundingSphere.center.z - a.geometry.boundingSphere.center.z
      }).forEach(function(obj) {
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
   dom.selfDestruct.addEventListener("click", function(event) {
      factory.destroy();
   });

   function seconds() {
      return (Date.now() % 100000) / 1000;
   }

   function webgl() {
		try {
			var canvas = document.createElement( 'canvas' );
         return !! ( window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ) );
		} catch ( e ) {
			return false;
		}
   }
})(window, Explorer3d)
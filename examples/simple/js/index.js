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
      verticalExaggeration: document.getElementById("exaggerate"),
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

   // Add a listener to the file drop area. This is where the action starts.
   let fileDrop = new Explorer3d.FileDrop(dom.fileDrop, function handler(file) {
      // What are they even trying for? No dinosaurs allowed.
      if (!appOptions.hasWebGl) {
         alert(refData.preWebGlMessage);
         return;
      }

      if(appOptions.fileSizeLimit) {
         // While size isn't standard the only browsers we care about have it.
         if(file.size && file.size > appOptions.fileSizeLimit) {
            alert(refData.ie11Warning);
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

   // We'll attach something to change vertical exaggeration now.
   let verticalExaggerate = new Explorer3d.VerticalExaggerate(factory).onChange(function() {
      Explorer3d.Logger.log("We have a trigger to vertical exaggerate");
      verticalExaggerate.set(+dom.verticalExaggeration.value);
   });
   dom.verticalExaggeration.addEventListener("change", function() {
      verticalExaggerate.set(+dom.verticalExaggeration.value);
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


   let coordinates = [[
                        [-122.48369693756104, 37.83381888486939],
                        [-122.48348236083984, 37.83317489144141],
                        [-122.48339653015138, 37.83270036637107],
                        [-125.48339653015138, 38.83270036637107],
                        [-122.48356819152832, 37.832056363179625],
                        [-122.48404026031496, 37.83114119107971],
                        [-122.48404026031496, 37.83049717427869],
                        [-122.48348236083984, 37.829920943955045],
                        [-122.48356819152832, 37.82954808664175],
                        [-122.48507022857666, 37.82944639795659],
                        [-122.48610019683838, 37.82880236636284],
                        [-122.48695850372314, 37.82931081282506],
                        [-122.48700141906738, 37.83080223556934],
                        [-122.48751640319824, 37.83168351665737],
                        [-122.48803138732912, 37.832158048267786],
                        [-122.48888969421387, 37.83297152392784],
                        [-122.48987674713133, 37.83263257682617],
                        [-121.49043464660643, 36.832937629287755],
                        [-122.49125003814696, 37.832429207817725],
                        [-122.49163627624512, 37.832564787218985],
                        [-122.49223709106445, 37.83337825839438],
                        [-122.49378204345702, 37.83368330777276],
                        [-122.48369693756104, 37.83381888486939],
                        [-122.48348236083984, 37.83317489144141],
                        [-122.48339653015138, 37.83270036637107],
                        [-125.48339653015138, 38.83270036637107],
                        [-122.48356819152832, 37.832056363179625],
                        [-122.48404026031496, 37.83114119107971],
                        [-122.48404026031496, 37.83049717427869],
                        [-122.48348236083984, 37.829920943955045],
                        [-122.48356819152832, 37.82954808664175],
                        [-122.48507022857666, 37.82944639795659],
                        [-122.48610019683838, 37.82880236636284],
                        [-122.48695850372314, 37.82931081282506],
                        [-122.48700141906738, 37.83080223556934],
                        [-122.48751640319824, 37.83168351665737],
                        [-122.48803138732912, 37.832158048267786],
                        [-122.48888969421387, 37.83297152392784],
                        [-122.48987674713133, 37.83263257682617],
                        [-121.49043464660643, 36.832937629287755],
                        [-122.49125003814696, 37.832429207817725],
                        [-122.49163627624512, 37.832564787218985],
                        [122.49223709106445, -37.83337825839438],
                        [-122.49378204345702, 37.83368330777276]
   ]];

   let now = Date.now();
   let result;
   for(let i = 0; i < 200000; i++) {
      result = boundingBoxAroundPolyCoords(coordinates);
   }
   console.log("Bad = " + (Date.now() - now));
   console.log(result);

   now = Date.now();
   for(let i = 0; i < 200000; i++) {
      result = calcExtent(coordinates[0]);
   }
   console.log("Good = " + (Date.now() - now));
   console.log(result);



   function boundingBoxAroundPolyCoords (coords) {
    var xAll = [], yAll = []

    for (var i = 0; i < coords[0].length; i++) {
      xAll.push(coords[0][i][1])
      yAll.push(coords[0][i][0])
    }

    xAll = xAll.sort()
    yAll = yAll.sort(function (a,b) { return a - b })

    return [ [xAll[0], yAll[0]], [xAll[xAll.length - 1], yAll[yAll.length - 1]] ]
  }


   function calcExtent(coords) {
      let lngMax = latMax = -Infinity;
      let lngMin = latMin = Infinity;
      coords[0].forEach(point => {
         lngMin = Math.min(point[0], lngMin);
         lngMax = Math.max(point[0], lngMax);
         latMin = Math.min(point[1], latMin);
         latMax = Math.max(point[1], latMax);
      });
      return [[lngMin, latMin], [lngMax, latMax]];
   }

})(window, Explorer3d)
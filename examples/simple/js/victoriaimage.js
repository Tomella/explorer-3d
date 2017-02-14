(function (global, Explorer3d) {
   /*
    * Set up some settings. Just configuration and data.
    */
   var appOptions = {
      workerCount: 3,
      browser: "modern",
      hasWebGl: webgl(),
      logLevel: Explorer3d.Logger.LOG_ALL // LOG_NOTHING, LOG_ERROR, LOG_WARN, LOG_INFO, LOG_ALL. It logs nothing by default.
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
   }

   // Keep all the DOM stuff together. Make the abstraction to the HTML here
   var dom = {
      verticalExaggeration: document.getElementById("exaggerate"),
      selfDestruct: document.getElementById("selfDestruct"),
      labelSwitch: document.getElementById("labelSwitch"),
      objectsList: document.getElementById("objectsList"),
      target: document.getElementById("target"),
      noWebGl: document.getElementById("noWebGl"),
      files: document.getElementsByClassName("gocadLinks"),
      body: document.body
   };

   // What are they even trying for? No dinosaurs allowed.
   if (!appOptions.hasWebGl) {
      dom.body.className = "disable";
      return;
   }

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

   // Get a handle on children each time it changes so we can draw a legend of layers.
   factory.addEventListener("objects.changed", function(event) {
      let count = 1;
      let target = dom.objectsList;
      target.innerHTML = "";
      target.className = "";

      // sort by center z value
      event.objects.sort(function(a, b) {
         if (!a.geometry.boundingSphere) a.geometry.computeBoundingSphere(); // Three lazy loads them.
         if (!b.geometry.boundingSphere) b.geometry.computeBoundingSphere();
         return b.geometry.boundingSphere.center.z - a.geometry.boundingSphere.center.z
      }).forEach(function(obj) {
         // Just some simple DOM elements.
         let template = document.createElement("div");
         template.className = "layer";
         let color = obj.material.color.getStyle();
         color = color ? color : "lightgray"
         template.style.backgroundColor = color;

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

         span.appendChild(inp);
         span.appendChild(text);

         template.appendChild(span);
         target.appendChild(template);
         target.className = "active";
      });
   });

   /**
    * Finish of UI modifiers
    */

   // See if we set projections
   let options = {
      blockSize: 1024 * 1024
   };
   Object.assign(options, appOptions);

   // Work out the base path.
   let path = document.location.pathname.substr(0, document.location.pathname.lastIndexOf("/") + 1) + "../data/";

   // Fire off three requests, wait for their promises to resolve then add some vertical exaggeration.
   Promise.all([
      { // We are using meters as it auto scales better ('cause the auto scaling works on a sphere and the z values are meters)
         type: "esriElevation",
         header: {
            name: "Elevation over Arthurs Seat",
         },
         template: "http://services.ga.gov.au/site_9/services/DEM_SRTM_1Second_over_Bathymetry_Topography/MapServer/WCSServer?SERVICE=WCS&VERSION=1.0.0&REQUEST=GetCoverage" +
                  "&coverage=1&CRS=EPSG:3857&BBOX=${bbox}&FORMAT=GeoTIFF&RESX=${resx}&RESY=${resy}&RESPONSE_CRS=EPSG:3857&HEIGHT=${height}&WIDTH=${width}",
         esriTemplate: "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${bbox}&f=JSON&format=jpg&size=${size}",
         // bbox: [16129000,-4635000,16141000,-4629000],
         bbox: [15679000,-4770000,16712000,-3778000],
         resolutionX: 700,
         resolutionY: 700,
         imageWidth: 4096,
         imageHeight: 4096,
         opacity: 1,
         extent: new Elevation.Extent2d(1000000, -10000000, 20000000, -899000),
      }].map(function(metadata) { return run(metadata) })).then(function() {
      // Make it look prettier.
      verticalExaggerate.set(dom.verticalExaggeration.value = 8);
   });

   function run(metadata) {
      // We are all set up so read me.
      let promise;
      switch (metadata.type) {
         case "gocad":
            promise = gocadParser.parse(metadata);
            break;
         case "elevation":
         case "wcswms":
            promise = new Explorer3d.ElevationParser(metadata).parse();
            break;
         case "esriElevation":
            promise = new Explorer3d.WcsEsriImageryParser(metadata).parse();
            break;
         default:
            return;
      }

      // Off to the parser to do its best
      Explorer3d.Logger.log(seconds() + ": We have started the process.");
      return promise.then(function(data) {
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
   }

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
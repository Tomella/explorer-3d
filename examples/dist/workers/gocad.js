importScripts('../../assets/worker/lib.js',
   '../../bower_components/proj4/dist/proj4.js'); //, '../../bower_components/components-threejs/three.js');

(function(context) {
   proj4.defs("EPSG:3112", "+proj=lcc +lat_1=-18 +lat_2=-36 +lat_0=0 +lon_0=134 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
   context.addEventListener('message', function(e) {
      var file = e.data.file;
      var options = e.data.options;
      var projectionFn = passThru;

      if(options && options.from && options.to) {
         projectionFn = reproject(options.from, options.to);
      }
      var name = file.name;
      var reader = new FileReader();

      reader.onload = function(e) {
         try {
            var document = new gocad.Document(new gocad.util.LineReader(e.target.result), projectionFn);
            debugger
            document.types.forEach(function(type) {
               if(type.type == "TSurf") {
                  context.postMessage({type: "IncrementalTSurf", state: "header", data:type.header});
                  context.postMessage({type: "IncrementalTSurf", state: "vertices", data:type.vertices});
                  context.postMessage({type: "IncrementalTSurf", state: "faces", data:type.faces});
               } else {
                  context.postMessage({type: "Other", state: "all", data:type});
               }
            });
            //context.postMessage(document);
            document = null;
         } catch(e) {
            context.postMessage({})
         }
      }
      console.log(file.name);
      reader.readAsText(file);
   }, false);

   function reproject(from, to) {
      return function(coords) {
         return proj4(from, to, [coords[0], coords[1]]);
      }
   }

   function passThru(coords) {
      return coords;
   }
})(this);
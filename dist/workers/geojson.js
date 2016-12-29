importScripts('../resources/proj4.js');

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
         var data = JSON.parse(e.target.result);
         var vset = new gocad.VSet(name);
         data.features.forEach(function(feature) {
            if(feature.geometry && feature.geometry.coordinates && feature.geometry.coordinates.length > 1) {
               var coords = feature.geometry.coordinates;
               var value = projectionFn(coords);
               coords[0] = value[0];
               coords[1] = value[1];
               coords[2] = coords[2]?coords[2]:0;
               vset.vertices.push(coords);
            }
         });

         context.postMessage({types:[vset]});
         context.close();
      }
      reader.readAsText(file);
   }, false);

   var gocad = {};

   gocad.VSet = VSet;

   function reproject(from , to) {
      return function(coords) {
         return proj4(from, to, [coords[0], coords[1]]);
      }
   }

   function passThru(coords) {
      return coords;
   }

   function VSet(name) {
      this.type = "VSet";
      this.coordinateSystem = {
         ZPOSITIVE: "Elevation"
      }
      this.header = {
         color: 0xff5555,
         name: name
      }
      this.vertices = [];
   }


})(this);
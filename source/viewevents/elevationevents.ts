export class ViewEvents extends THREE.EventDispatcher {
   static MOUSE_DOWN = "mouse.down";

   element: HTMLCanvasElement;
   constructor(public renderer, public camera) {
      super();
      let element = this.element = renderer.domElement

		let last = new Date().getTime();
		let down = false;
		let sx = 0, sy = 0;

      element.onmousedown = (ev: MouseEvent) => {
         let rect = element.getBoundingClientRect();
         down = true;
         sx = ev.clientX;
         sy = ev.clientY;
         var mouse = new THREE.Vector2();

         mouse.x = ( (ev.clientX - rect.left) / renderer.domElement.clientWidth ) * 2 - 1;
         mouse.y = - ( (ev.clientY - rect.top) / renderer.domElement.clientHeight ) * 2 + 1;

         this.dispatchEvent({
            type: ViewEvents.MOUSE_DOWN,
            data: mouse
         });
      };

         renderer.domElement.onmouseup = function() {
            down = false;
         };

         var raycaster = new THREE.Raycaster();

         renderer.domElement.onmousemove = function( event: MouseEvent) {
            var feature: any;
            var rect = renderer.domElement.getBoundingClientRect();
            var mouse = new THREE.Vector2();
            event.preventDefault();

            mouse.x = ( (event.clientX - rect.left) / renderer.domElement.clientWidth ) * 2 - 1;
            mouse.y = - ( (event.clientY - rect.top) / renderer.domElement.clientHeight ) * 2 + 1;

            raycaster.setFromCamera( mouse, camera );

            var intersects = raycaster.intersectObject( points, true );

            if ( intersects.length > 0 ) {
               feature = d.features[intersects[0].index];
               $rootScope.$broadcast(config.onhoverEventName, decorateHtml(feature));
            }

            function decorateHtml(feature: GeoJSON.Feature) {
               var html: string, br: string;
               var properties = feature.properties;

               if(properties && !properties.html) {
                  html = "<div class='popup-header'><strong>ID: </strong><a class='title-link' target='_blank' href='" +
                  config.dataUrl.replace("{id}", feature.id) + "'>" + feature.id + "</a></div>Lon/lat elev: " +
                     feature.geometry.coordinates[0].toFixed(6) + "/" +
                     feature.geometry.coordinates[1].toFixed(6) +
                     " " + (typeof feature.geometry.coordinates[2] == "undefined"?"-":feature.geometry.coordinates[2]);

                  br = "<br/>";

                  for (var property in properties) {
                      if (properties.hasOwnProperty(property)) {
                          html += br + property + "<br/>&#160;" + properties[property];
                      }
                  }
                  properties.html = html;
               }
               return feature;
            }
         }
   }
}
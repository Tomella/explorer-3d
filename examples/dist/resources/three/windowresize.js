var THREEExt = THREEExt || {};

THREEExt.WindowResize	= function(renderer, camera, container){
	container 	= container || window;

	var callback = function(){
		// fetch target renderer size
		var rendererSize = container.getBoundingClientRect();
		// notify the renderer of the size change
		renderer.setSize( rendererSize.width, rendererSize.height )
		// update the camera
		camera.aspect	= rendererSize.width / rendererSize.height
		camera.updateProjectionMatrix()
	}

	// bind the resize event
	window.addEventListener('resize', callback, false)
	// return .stop() the function to stop watching window resize
	return {
		trigger	: function(){
			callback()
		},
		/**
		 * Stop watching window resize
		*/
		destroy	: function(){
			window.removeEventListener('resize', callback)
		}
	}
}
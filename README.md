# explorer.3d

Core technologies are:
* Runtime (see the bower.json file)
  * ThreeJS
  * Proj4j
  * GeoTiffParser
* Developement time (See package.json)
  * NodeJS
  * Express
  * Gulp
  * Typescript 2.0
  * Rollup
* Integration testing - Whatever you feel like. The greater the diversity the better. Just use stuff that is available by CDN and everything should run smoothly.


## Developing.
### Global installs
* Gulp
* Typescript 2.x
* Run npm install
* Run bower install (this copies into the examples/bower-components directory)


## Typescript definitions.
No typings! We use the modern way (at this time, anyway) way of including typescript definitions, that is NPM. See package.json

## Unit testing
Not my strong point. If interested you can do a push request. Maybe I'll learn something.

## Integration testing
The examples directory has a bunch of demo apps and I find it easiest to build in there or extend the existing apps so run:
`> node server`

This serves both the content from the `examples` directory as 'http://localhost:3000/' and directly from the `dist` directory as '/dist'

So having gulp running means that the code builds directly into the `dist` directory and is thus immediately available on a browser refresh.

## Consuming.
If you are going to use the library there are CDN repositories for:
* Proj4js - https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.3.15/proj4.js
* ThreeJS - https://cdnjs.cloudflare.com/ajax/libs/three.js/r79/three.min.js

Proj4js allows data stored in different projections to be transformed onto the projection of the viewport.

ThreeJS is the WebGL wrapper that allows 3D rendering in a more abstracted way.
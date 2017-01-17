let line = [[120, 0], [122, 0], [124, 0], [125, 0], [126, 0], [128, 0], [129, 0], [130, 0]];

let count = 500; // So ten segments

//let result = Elevation.densify(line, count);
//console.log(result);

let template = "http://services.ga.gov.au/gis/services/DEM_SRTM_1Second_over_Bathymetry_Topography/MapServer/WCSServer"
      + "?SERVICE=WCS&VERSION=1.0.0&REQUEST=GetCoverage&coverage=1&CRS=EPSG:4326&BBOX=${bbox}&FORMAT=GeoTIFF&RESX=${resx}&RESY=${resy}&"
      + "RESPONSE_CRS=EPSG:4326&HEIGHT=${height}&WIDTH=${width}";

// var loader = new Elevation.PointElevationLoader();

// loader.load(template, [144.9508, -38.35358]).then(response => {
//    console.log("Loaded point = ");
//    console.log(response);
// });


var arealoader = new Elevation.AreaElevationLoader(Elevation.Extent2d.AUSTRALIA);
arealoader.load(template, [144.9, -38.4, 145, -38.3, ], {resolutionX: 10}).then(response => {
   console.log("Loaded area = ");
   console.log(response);
});
/*
var gridloader = new Elevation.GridElevationLoader(Elevation.Extent2d.AUSTRALIA);
gridloader.load(template, [144.9, -38.4, 145, -38.3, ], {resolutionX: 10}).then(response => {
   console.log("Loaded area = ");
   console.log(JSON.stringify(response));
});
*/

var xyzloader = new Elevation.XyzElevationLoader(Elevation.Extent2d.AUSTRALIA);
xyzloader.load(template, [144.9, -38.4, 145, -38.3, ], {resolutionX: 10}).then(response => {
   console.log("Loaded area = ");
   console.log(JSON.stringify(response));
});


var geojsonloader = new Elevation.GeojsonElevationLoader(Elevation.Extent2d.AUSTRALIA);
geojsonloader.load(template, [144.9, -38.4, 145, -38.3, ], {resolutionX: 10}).then(response => {
   console.log("Loaded area = ");
   console.log(JSON.stringify(response));
});
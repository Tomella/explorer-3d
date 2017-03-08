export class EsriImageryLoader {
   constructor(public options: any) {}

   load(): Promise<any> {
      let url = this.options.esriTemplate
            .replace("${bbox}", this.options.bbox)
            .replace("${format}", "JSON")
            .replace("${size}", this.options.resolutionX + "," + this.options.resolutionY);

      let loader = new Elevation.HttpTextLoader(url, this.options);
      // Get the ESRI Metadata.
      return loader.load().then(text => JSON.parse(text));
   }
}
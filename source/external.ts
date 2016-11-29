declare namespace THREE {
   export class DataSurfaceLoader {
      load(elevationUrl: string, imageryUrl: string, onLoad: any, onProgress?: any, onError?: any): void;
      parse(data: any): void;
      setConfig(options: any): void;
   }

   export class GeotiffTerrainLoader {
      load(url: string, onLoad: Function, onProgress?: Function, onError?: Function): void;
   }

   export class FlyControls {
      constructor(camera: THREE.Camera, element?: HTMLElement);

      update(val?: any): void;
      domElement: HTMLElement;
      center: Vector3;
      movementpeed: number;
      rollSpeed: number;
      dragToLock: boolean;
      autoForward: boolean;
   }


   export class ZOrbitControls {
      constructor(camera: THREE.Camera, element: HTMLElement);
      update(): void;
      domElement: HTMLElement;
      center: Vector3;
   }

   export class Lut {
      constructor(colormap: string, numberofcolors?: number);
      setMax(max: number): void;
      setMin(min: number): void;
      getColor( colorValue: number ): THREE.Color;
   }
}

declare namespace THREEExt {
   export function WindowResize(renderer: THREE.Renderer, camera: THREE.Camera, element: HTMLElement): any;
}

declare class GeotiffParser {
  parseHeader(data: any): void;
  loadPixels(): number[];
}
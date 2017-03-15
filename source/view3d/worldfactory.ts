import { CameraPositioner } from "./camerapositioner";
import { World } from "./world";
import { deepMerge } from "../util/deepmerge";

export class WorldFactory extends THREE.EventDispatcher {
   private state = {
      world: <World>null,
      dataContainer: null,
      get isAllVisible() {
         if (this.state.world && this.state.world.scene) {
            return !this.state.dataContainer.children.some(function (layer) {
               return !layer.visible;
            });
         }
      }
   };

   private options: any = {
      axisHelper: {
         on: true,
         labels: {
            x: " East ",
            y: " North ",
            z: " Elevation "
         }
      }
   };

   constructor(public element: HTMLElement, options: any = {}) {
      super();
      this.options = deepMerge(this.options, options);
      this.options.cameraPositioner = options.cameraPositioner ? options.cameraPositioner : new CameraPositioner();
   }

   destroy(): void {
      if (this.state.world) {
         this.state.world.destroy();
         this.state.world = null;
         this.state.dataContainer = null;
         this.dispatchEvent({
            type: "objects.changed",
            objects: []
         });
      }
   }

   remove(obj: THREE.Object3D): boolean {
      let result = false;
      if (this.state.dataContainer) {
         this.state.dataContainer.remove(obj);
         result = this.state.dataContainer.children.length > 0;
         if (!result) {
            this.destroy();
         } else {
            this.resize();
            this.dispatchEvent({
               type: "objects.changed",
               objects: this.state.dataContainer.children
            });
         }
      }
      return result;
   }

   resize() {
      let box = new THREE.Box3().setFromObject(this.state.dataContainer);
      let center = box.getCenter();
      let radius = box.getBoundingSphere().radius;
      let z = radius * 2.5;

      let options = deepMerge({
         radius: radius,
         axisHelper: {
            on: true,
            size: radius,
            position: {
               x: center.x,
               y: center.y,
               z: center.z
            }
         },
         camera: this.options.cameraPositioner.onResize(z, radius, center),
         lights: {
            directional: {
               center: {
                  x: center.x,
                  y: center.y,
                  z: center.z
               },
               position: {
                  dx: radius,
                  dy: -radius,
                  dz: z
               }
            }
         }
      }, this.options);
      this.state.world.resize(options);
   }

   public show(data: THREE.Object3D): void {
      if (!this.state.dataContainer) {
         this.create(data);
      } else {
         this.extend(data);
      }

      this.dispatchEvent({
         type: "objects.changed",
         objects: this.state.dataContainer.children
      });
   }

   public create(data: THREE.Object3D): void {
      this.state.dataContainer = new THREE.Object3D();
      this.state.dataContainer.add(data);

      let box = new THREE.Box3().setFromObject(data);
      let center = box.getCenter();
      data.userData.center = center;
      let radius = box.getBoundingSphere().radius;
      let z = radius * 4;
      let options = deepMerge({
         radius: radius,
         axisHelper: {
            on: true,
            size: radius,
            position: {
               x: center.x,
               y: center.y,
               z: center.z
            }
         },
         camera: this.options.cameraPositioner.onCreate(z, radius, center),
         lights: {
            directional: {
               center: {
                  x: center.x,
                  y: center.y,
                  z: center.z
               },
               position: {
                  dx: radius,
                  dy: radius,
                  dz: z
               }
            }
         }
      }, this.options);

      if (this.state.world) {
         this.state.world.destroy();
      }
      this.state.world = new World(this.element, options);
      // window["world"] = state.world;
      this.add(this.state.dataContainer);
      this.dispatchEvent({
         type: "world.created",
         factory: this
      });
   }

   public getWorld() {
      return this.state.world;
   }

   public add(obj3d: THREE.Object3D) {
      this.state.world.scene.add(obj3d);
      this.state.world.dataContainer = obj3d;
   }

   public extend(data: THREE.Object3D, resize: boolean = true): void {
      this.state.dataContainer.add(data);

      // Sometimes we don't want a flash.
      if (!resize) {
         return;
      }

      let center = new THREE.Box3().setFromObject(data).getCenter();
      data.userData.center = center;

      let box = new THREE.Box3().setFromObject(this.state.dataContainer);
      center = box.getCenter();
      let radius = box.getBoundingSphere().radius;
      let z = radius * 4;
      let options = Object.assign({
         radius: radius,
         axisHelper: {
            on: true,
            size: radius,
            position: {
               x: center.x,
               y: center.y,
               z: center.z
            }
         },
         camera: this.options.cameraPositioner.onExtend(z, radius, center),
         lights: {
            directional: {
               center: {
                  x: center.x,
                  y: center.y,
                  z: center.z
               },
               position: {
                  dx: radius,
                  dy: -radius,
                  dz: z
               }
            }
         }
      }, this.options);

      this.state.world.update(options);
   }
}
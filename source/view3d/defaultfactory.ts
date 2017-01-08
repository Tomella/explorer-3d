import { World } from "./world";

export class DefaultWorldFactory extends THREE.EventDispatcher {
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

   constructor(public element: HTMLElement) {
      super();
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

      let options = {
         radius: radius,
         axisHelper: {
            on: true,
            size: radius,
            position: {
               x: center.x,
               y: center.y,
               z: center.z
            },
            labels: {
               x: " East ",
               y: " North ",
               z: " Elevation "
            }
         },
         camera: {
            far: z * 250,
            near: radius * 0.01,
            lookAt: {
               x: center.x,
               y: center.y,
               z: center.z
            }
         },
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
      };
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
      let options = {
         radius: radius,
         axisHelper: {
            on: true,
            size: radius,
            position: {
               x: center.x,
               y: center.y,
               z: center.z
            },
            labels: {
               x: " East ",
               y: " North ",
               z: " Elevation "
            }
         },
         camera: {
            far: z * 250,
            near: radius * 0.01,
            up: {
               x: 0,
               y: 0,
               z: 1
            },
            position: {
               x: center.x,
               y: center.y - 3 * radius,
               z: center.z + radius
            },
            lookAt: {
               x: center.x,
               y: center.y,
               z: center.z
            }
         },
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
      };
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

   public extend(data: THREE.Object3D): void {
      let center = new THREE.Box3().setFromObject(data).getCenter();
      data.userData.center = center;
      this.state.dataContainer.add(data);
      let box = new THREE.Box3().setFromObject(this.state.dataContainer);
      center = box.getCenter();
      let radius = box.getBoundingSphere().radius;
      let z = radius * 4;
      let options = {
         radius: radius,
         axisHelper: {
            on: true,
            size: radius,
            position: {
               x: center.x,
               y: center.y,
               z: center.z
            },
            labels: {
               x: " East ",
               y: " North ",
               z: " Elevation "
            }
         },
         camera: {
            far: z * 250,
            near: radius * 0.01,
            up: {
               x: 0,
               y: 0,
               z: 1
            },
            position: {
               x: center.x,
               y: center.y - 3 * radius,
               z: center.z + radius
            },
            lookAt: {
               x: center.x,
               y: center.y,
               z: center.z
            }
         },
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
      };
      this.state.world.update(options);
   }
}
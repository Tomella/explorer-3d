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

   public element: HTMLElement;

   constructor () {
      super();
   }

   public show(data): World {
      if (!this.state.dataContainer) {
         return this.create(data);
      } else {
         return this.extend(data);
      }
   }

   public create(data): World {
      let state = this.state;
      let container = new THREE.Object3D();
      container.add(data);
      state.dataContainer = container;
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
      if (state.world) {
         state.world.destroy();
         state.world = null;
      }
      state.world = new World(this.element, options);
      // window["world"] = state.world;
      this.add(this.state.dataContainer);
      this.dispatchEvent({
         type: "world.created",
         world: state.world
      });
      return state.world;
   }

   public add(obj3d) {
      this.state.world.scene.add(obj3d);
      this.state.world.dataContainer = obj3d;
   }

   public extend(data): World {
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
      return this.state.world;
   }
}
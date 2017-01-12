/// <reference path="../external.d.ts" />
import { deepMerge } from "../util/deepmerge";
import { Resizer } from "../modifiers/resizer";

export class World {
   private options: any = {
      camera: {
         fov: 45,
         near: 0.1,
         far: 500000,
         position: {
            x: -30,
            y: 40,
            z: 30
         },
         up: {
            x: 0,
            y: 1,
            z: 0
         }
      },
      lights: {
         ambient: {
            color: 0x555555
         },
         directional: {
            color: 0xa0a0a0,
            center: {
               x: 0,
               y: 0,
               z: 0
            },
            position: {
               dx: 50,
               dy: 10,
               dz: - 300
            }
         }
      },
      axisHelper: {
         on: true,
         size: 20
      }
   };

   axis: THREE.AxisHelper;
   camera: THREE.PerspectiveCamera;
   container: HTMLElement;
   continueAnimation: boolean;
   controls: any;
   dataContainer: THREE.Object3D;
   labels: THREE.Object3D;
   lights: THREE.Light[] = [];
   lookAt: THREE.Vector3;
   scene: THREE.Scene;
   renderer: THREE.Renderer;
   resizer: any;

   constructor(container: HTMLElement | string, options: any = {}) {
      this.options = deepMerge(this.options, options);

      let rect = document.body.getBoundingClientRect();
      if (typeof container === "string") {
         this.container = document.getElementById("" + container);
      } else {
         this.container = <HTMLElement>container;
      }
      this.scene = new THREE.Scene();
      this.renderer = new THREE.WebGLRenderer({ clearColor: 0xff0000 });

      this.renderer.setSize(rect.width, rect.height);

      let cam = this.options.camera;
      this.camera = new THREE.PerspectiveCamera(cam.fov, rect.width / rect.height, cam.near, cam.far);
      this.camera.up.set(cam.up.x, cam.up.y, cam.up.z);

      let pos = cam.position;
      this.camera.position.x = pos.x;
      this.camera.position.y = pos.y;
      this.camera.position.z = pos.z;
      if (options.camera.lookAt) {
         let la = options.camera.lookAt;
         this.lookAt = new THREE.Vector3(la.x, la.y, la.z);
      } else {
         this.lookAt = this.scene.position;
      }
      this.camera.lookAt(this.lookAt);

      this.container.appendChild(this.renderer.domElement);
      this.renderer.render(this.scene, this.camera);

      this.axisHelper(this.options.axisHelper.on);
      this.addLights();
      // this.addControls();
      this.addFlyControls();
      this.resizer = new Resizer(this.renderer, this.camera, this.container);

      let context = this;
      this.continueAnimation = true;

      this.resizer.resize();
      animate();
      function animate() {
         if (!context.continueAnimation) return;
         window.requestAnimationFrame(animate);

         // context.renderer.clear();
         context.camera.lookAt(context.lookAt);
         context.renderer.render(context.scene, context.camera);
         context.controls.update(0.02);
      }
   }

   destroy(): void {
      this.lights = [];
      this.axis = null;
      this.renderer.dispose();
      this.renderer = null;
      this.dataContainer.children.forEach(child => {
         child.geometry.dispose();
         child.material.dispose();
      });
      this.scene.remove(this.dataContainer);
      this.scene = null;
      this.camera = null;
      if (this.controls.dispose) {
         this.controls.dispose();
      }
      this.controls = null;
      this.resizer.destroy();
      this.resizer = null;
      while (this.container.lastChild) this.container.removeChild(this.container.lastChild);
      this.continueAnimation = false;
   }

   resize(options: any) {
      this.options = deepMerge(this.options, options ? options : {});
      // Clear and set axishelper
      let state = this.options.axisHelper.on;
      this.axisHelper(false);
      this.axisHelper(state);
      this.updateLights();

      let la = options.camera.lookAt;
      this.lookAt = new THREE.Vector3(la.x, la.y, la.z);
      this.camera.far = options.camera.far;
      this.camera.near = options.camera.near;
      this.camera.lookAt(this.lookAt);
   }

   update(options: any) {
      this.options = deepMerge(this.options, options ? options : {});

      let cam = this.options.camera;
      this.camera.up.set(cam.up.x, cam.up.y, cam.up.z);

      let pos = cam.position;
      this.camera.position.x = pos.x;
      this.camera.position.y = pos.y;
      this.camera.position.z = pos.z;
      if (options.camera.lookAt) {
         let la = options.camera.lookAt;
         this.lookAt = new THREE.Vector3(la.x, la.y, la.z);
      } else {
         this.lookAt = this.scene.position;
      }
      this.camera.lookAt(this.lookAt);

      this.controls.movementSpeed = this.options.radius;

      // Clear and set axishelper
      let state = this.options.axisHelper.on;
      this.axisHelper(false);
      this.axisHelper(state);
      this.updateLights();

   }

   private addLabels(scale: number): THREE.Object3D {
      let visible = true;
      if (this.labels) {
         visible = this.labels.visible;
         this.scene.remove(this.labels);
      }
      let container = this.labels = new THREE.Object3D();
      let pos = this.options.axisHelper.position;
      let offset = this.options.axisHelper.size;
      let labels = this.options.axisHelper.labels;
      let options = {
         fontsize: 64,
         backgroundColor: { r: 255, g: 200, b: 200, a: 0.7 }
      };

      let sprite = makeTextSprite(labels.x, options);
      sprite.position.set(pos.x + offset, pos.y, pos.z);
      container.add(sprite);

      options.backgroundColor = { r: 200, g: 255, b: 200, a: 0.7 };
      sprite = makeTextSprite(labels.y, options);
      sprite.position.set(pos.x, pos.y + offset, pos.z);
      container.add(sprite);

      options.backgroundColor = { r: 200, g: 200, b: 255, a: 0.7 };
      sprite = makeTextSprite(labels.z, options);
      sprite.position.set(pos.x, pos.y, pos.z + offset);
      container.add(sprite);
      this.scene.add(container);
      container.visible = visible;
      return container;

      function makeTextSprite(message: string, parameters: any): THREE.Sprite {
         let parms = deepMerge({
            fontface: "Arial",
            fontsize: 18,
            borderThickness: 4,
            borderColor: { r: 0, g: 0, b: 0, a: 1.0 },
            backgroundColor: { r: 255, g: 255, b: 255, a: 1.0 }
         }, parameters ? parameters : {});

         let canvas = document.createElement("canvas");
         let context = canvas.getContext("2d");
         context.font = parms.fontsize + "px " + parms.fontface;

         // get size data (height depends only on font size)
         let metrics = context.measureText(message);
         let textWidth = metrics.width;
         // console.log(textWidth);

         // background color
         context.fillStyle = "rgba(" + parms.backgroundColor.r + "," + parms.backgroundColor.g + ","
            + parms.backgroundColor.b + "," + parms.backgroundColor.a + ")";
         // border color
         context.strokeStyle = "rgba(" + parms.borderColor.r + "," + parms.borderColor.g + ","
            + parms.borderColor.b + "," + parms.borderColor.a + ")";

         context.lineWidth = parms.borderThickness;
         roundRect(context,
            parms.borderThickness / 2,
            parms.borderThickness / 2,
            textWidth + parms.borderThickness,
            parms.fontsize * 1.4 + parms.borderThickness,
            6
         );
         // 1.4 is extra height factor for text below baseline: g,j,p,q.

         // text color
         context.fillStyle = "rgba(0, 0, 0, 1.0)";
         context.fillText(message, parms.borderThickness, parms.fontsize + parms.borderThickness);

         // canvas contents will be used for a texture
         let texture = new THREE.Texture(canvas);
         texture.needsUpdate = true;

         let spriteMaterial = new THREE.SpriteMaterial({
            map: texture
         });
         let sprite = new THREE.Sprite(spriteMaterial);
         sprite.scale.set(scale * 35, scale * 15, 1); // scale * 1);

         return sprite;
      }

      function roundRect(ctx: any, x: number, y: number, w: number, h: number, r: number) {
         ctx.beginPath();
         ctx.moveTo(x + r, y);
         ctx.lineTo(x + w - r, y);
         ctx.quadraticCurveTo(x + w, y, x + w, y + r);
         ctx.lineTo(x + w, y + h - r);
         ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
         ctx.lineTo(x + r, y + h);
         ctx.quadraticCurveTo(x, y + h, x, y + h - r);
         ctx.lineTo(x, y + r);
         ctx.quadraticCurveTo(x, y, x + r, y);
         ctx.closePath();
         ctx.fill();
         ctx.stroke();
      }
   }

   axisHelper(on: boolean) {
      if (this.axis) {
         if (!on) {
            this.scene.remove(this.axis);
            this.axis = null;
         }
      } else {
         if (on) {
            let options = this.options.axisHelper;
            this.axis = new THREE.AxisHelper(options.size);
            if (options.position) {
               this.axis.position.set(options.position.x, options.position.y, options.position.z);
               if (options.labels) {
                  let scale = options.size / 100;
                  this.addLabels(scale);
               }
            }
            this.scene.add(this.axis);
         }
      }
      this.options.axisHelper.on = on;
   }

   private addControls() {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      // this.controls.addEventListener( 'change', render ); // add this only if there is no animation loop (requestAnimationFrame)
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.25;
      this.controls.enableZoom = true;
      this.controls.userPanSpeed = 20000;
   };

   private addFirstPersonControls() {
      this.controls = new THREE.FirstPersonControls(this.camera, this.renderer.domElement);
      // this.controls.movementSpeed = this.options.radius;
      // this.controls.domElement = this.container;
      // this.controls.rollSpeed = Math.PI * 24 * this.options.radius;
      // this.controls.autoForward = false;
      // this.controls.dragToLook = false;
   };


   private addFlyControls() {
      this.controls = new THREE.FlyControls(this.camera, this.renderer.domElement);
      this.controls.movementSpeed = this.options.radius;
      this.controls.domElement = this.container;
      this.controls.rollSpeed = Math.PI * 24;
      this.controls.autoForward = false;
      this.controls.dragToLook = false;
   };

   private addLights() {
      let data = this.options.lights;
      this.lights[0] = new THREE.AmbientLight(data.ambient.color);
      this.scene.add(this.lights[0]);

      let dir = data.directional;

      this.lights[1] = new THREE.DirectionalLight(dir.color);
      this.lights[1].position.set(dir.center.x + dir.position.dx, dir.center.y + dir.position.dy, dir.center.z + dir.position.dz);
      this.scene.add(this.lights[1]);

      this.lights[2] = new THREE.DirectionalLight(dir.color);
      this.lights[2].position.set(dir.center.x + dir.position.dx, dir.center.y + dir.position.dy, dir.center.z - dir.position.dz);
      this.scene.add(this.lights[2]);
   };

   private updateLights() {
      this.scene.remove(this.lights[0]);
      this.scene.remove(this.lights[1]);
      this.scene.remove(this.lights[2]);
      this.addLights();
   }
}

import { TSurf, Document, Header, CoordinateSystem } from "../libs";
import { loadBstones } from "./bstone";
import { loadBorders } from "./borders";

export class TSurfLoader {
   private geometry: THREE.Geometry;
   private material: THREE.Material;
   private userData: any;

   constructor() {
      this.geometry = new THREE.Geometry();
      this.userData = {};
   }

   setHeader(header: Header) {
      this.userData.header = header;
      let color = header.solidColor;
      this.material = new THREE.MeshLambertMaterial({
         color: color ? color : 0xff1111,
         side: THREE.DoubleSide
      });
   }

   setVertices(vertices: number[][]) {
      vertices.forEach((vertex: number[]) => {
         this.geometry.vertices.push(new THREE.Vector3(vertex[0], vertex[1], vertex[2]));
      });
   }

   setCoordinateSystem(coords: CoordinateSystem) {
      this.userData.coordinateSystem = coords;
   }

   setFaces(faces: number[][]) {
      faces.forEach((face: number[]) => {
         // GOCAD indexes with a base of 1. Normalize.
         this.geometry.faces.push(new THREE.Face3(face[0] - 1, face[1] - 1, face[2] - 1));
      });
   }

   createMesh() {
      this.geometry.computeBoundingBox();
      this.geometry.computeFaceNormals();
      let mesh = new THREE.Mesh(this.geometry, this.material);
      mesh.userData = this.userData;
      return mesh;
   }
}

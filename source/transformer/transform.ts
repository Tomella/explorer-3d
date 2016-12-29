import { loadTSurf } from "../bridge3js/tsurf";
import { loadPLine } from "../bridge3js/pline";
import { loadVSet }  from "../bridge3js/vset";

export class Transformer {

   static transform(doc: gocad.Document): THREE.Object3D {
      let response: THREE.Object3D;

      if (doc.types) {
         doc.types.forEach((type: gocad.Type) => {
            if (type.type === "TSurf") {
               response = loadTSurf(<TSurf>type);
            } else if (type.type === "PLine") {
               response = loadPLine(<PLine>type);
            } else if (type.type === "VSet") {
               response = loadVSet(<VSet>type);
            }
         });
      } else {
         return null;
      }
      response.userData = {
         header: doc.types[0].header,
         coordinateSystem: doc.types[0].coordinateSystem
      };
      return response;
   }
}

class ObjWithGeom extends THREE.Object3D {
   geometry: THREE.Geometry;
}

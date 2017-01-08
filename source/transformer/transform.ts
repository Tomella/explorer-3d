import { loadTSurf } from "../bridge3js/tsurf";
import { loadPLine } from "../bridge3js/pline";
import { loadVSet }  from "../bridge3js/vset";

import { Document }  from "../gocad/document";
import { Type }  from "../gocad/type";
import { TSurf }  from "../gocad/tsurf";
import { PLine }  from "../gocad/pline";
import { VSet }  from "../gocad/vset";

export class Transformer {

   static transform(doc: Document): THREE.Object3D {
      let response: THREE.Object3D;

      if (doc.types) {
         doc.types.forEach((type: Type) => {
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

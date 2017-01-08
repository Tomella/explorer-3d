import { EventDispatcher } from "../util/eventdispatcher";
import { Header } from "./header";
import { CoordinateSystem } from "./coordinatesystem";

export class Type {
   public type: string = "Type";
   public header: Header;
   public coordinateSystem: CoordinateSystem;
   public isValid: boolean = false;
}


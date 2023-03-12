import { isEmpty } from "lodash";
import { AIInfo } from "../leftpanel/types";

class Coordinates {
  static KEYS = {
    NOSE: "NOSE",
    FACE: "FACE",
    EYES: "EYES",
    MOUTH: "MOUTH"
  };
  info = new Map<string, AIInfo[]>();
  constructor(data: any) {
    if (!isEmpty(data)) {
      Object.keys(data).forEach((e: string) => {
        this.info.set(e, data[e]);
      });
    }
  }

  getNoseMarkers = () => {
    return this.info.has(Coordinates.KEYS.NOSE) ? this.info.get(Coordinates.KEYS.NOSE) : [];
  };

  getFaceMarkers = () => {
    return this.info.has(Coordinates.KEYS.FACE) ? this.info.get(Coordinates.KEYS.FACE) : [];
  };

  getEyesMarkers = () => {
    return this.info.has(Coordinates.KEYS.EYES) ? this.info.get(Coordinates.KEYS.EYES) : [];
  };

  getMouthMarkers = () => {
    return this.info.has(Coordinates.KEYS.MOUTH) ? this.info.get(Coordinates.KEYS.MOUTH) : [];
  };
}

export default Coordinates;

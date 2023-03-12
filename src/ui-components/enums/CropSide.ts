import { PropertyUtil, StringUtil } from "../utils";

export enum CropSide {
  TOP = "Top",
  BOTTOM = "Bottom",
  RIGHT = "Right",
  LEFT = "Left"
}

export class CropSideUtil {
  static parse(cropSide: string): CropSide {
    const cropSideStr = StringUtil.toCamelCase(cropSide ? cropSide.trim() : cropSide);
    switch (cropSideStr) {
      case "Right":
        return CropSide.RIGHT;
      case "Left":
        return CropSide.LEFT;
      case "Bottom":
        return CropSide.BOTTOM;
      case "Top":
      default:
        return CropSide.TOP;
    }
  }
}

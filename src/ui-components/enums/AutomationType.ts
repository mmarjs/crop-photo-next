import { PropertyUtil, StringUtil } from "../utils";

export enum AutomationType {
  SMART_CROP = "smart_crop",
  UNRECOGNIZABLE_CROP = "unrecognizable_crop",
  REMOVE_BG_RESIZE = "remove_bg_resize"
}

export class AutomationTypeUtil {
  static parse(automationTypeStr: string): AutomationType {
    switch (automationTypeStr) {
      case "smart_crop":
        return AutomationType.SMART_CROP;
      case "unrecognizable_crop":
        return AutomationType.UNRECOGNIZABLE_CROP;
      case "remove_bg_resize":
        return AutomationType.REMOVE_BG_RESIZE;
      default:
        return AutomationType.SMART_CROP;
    }
  }
}

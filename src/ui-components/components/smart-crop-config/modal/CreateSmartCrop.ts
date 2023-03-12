import AutomationItem from "../../../../models/AutomationItem";

export class CreateSmartCrop {
  automation?: AutomationItem;
  smart_crop_automation_configuration?: SmartCropAutomationConfiguration;
}

export class SmartCropAutomationConfiguration {
  schema?: number;
  marker?: any;
  crop_type?: "crop_around" | "crop_from";
  crop_around_config?: CropTypeConfigCropAround;
  crop_from_config?: CropTypeConfigCropFrom;
  remove_background?: boolean;
}

export class CropTypeConfigCropAround {
  position_x?: number;
  position_y?: number;
  crop_side?: CropSideType;
}

export class CropTypeConfigCropFrom {
  include_markers_boundary?: boolean;
  crop_side_values?: CropSideType;
  crop_side?: "top" | "right" | "bottom" | "left";
}

export class CropSideType {
  top?: number;
  left?: number;
  bottom?: number;
  right?: number;
}

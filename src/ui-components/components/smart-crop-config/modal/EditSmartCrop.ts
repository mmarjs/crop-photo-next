import { CropTypeConfigCropAround, CropTypeConfigCropFrom } from "./CreateSmartCrop";

export class EditSmartAutomationConfig {
  id?: string;
  type?: "SMART_CROP";
  status?: "CONFIGURED";
}

export class EditSmartSmartCropConfig {
  schema?: number;
  marker?: string;
  crop_type?: string;
  crop_around_config?: CropTypeConfigCropAround;
  crop_from_config?: CropTypeConfigCropFrom;
  remove_background?: boolean;
}
export class EditSmartCropConfig {
  automation?: EditSmartAutomationConfig;
  smart_crop_automation_configuration?: EditSmartSmartCropConfig;
}

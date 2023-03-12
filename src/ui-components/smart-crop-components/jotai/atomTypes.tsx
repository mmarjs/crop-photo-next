export const defaultUnrecCropConfig = {
  schema: 1,
  name: "",
  step: 0,
  type: "CROP",
  marker: "BETWEEN_EYES_AND_NOSE",
  crop_type: "CROP_FROM",
  crop_around_config: {
    position_x: 0,
    position_y: 0,
    crop_side: {
      top: 20,
      bottom: 20,
      left: 20,
      right: 20
    }
  },
  crop_from_config: {
    include_markers_boundary: false,
    crop_side_values: {
      top: 100,
      bottom: 100,
      left: 100,
      right: 100
    },
    crop_side: "BOTTOM"
  },
  enable_body_parts_detection: undefined
} as CropMarkerSize;

export const defaultRemoveBgConfig = {
  schema: 1,
  remove_background: false,
  background_color: "#FFFFFF",
  transparency: 0,
  step: 1,
  type: "BG",
  custom_background_image_paths: []
} as RemoveBgConfig;

export const defaultSizeConfig = {
  schema: 1,
  media_conversion_options: [],
  allow_padding: true,
  step: 2,
  type: "DOWNLOAD"
} as DownloadConfiguration;

export type SampleCropImage = {
  id: string;
  signed_s3_url: string;
  removed_bg_signed_s3_url: string;
  s3_path?: string;
};

export const CROP_TYPES = {
  CROP_FROM: "CROP_FROM",
  CROP_AROUND: "CROP_AROUND"
};
export const MODE = { EDIT: "EDIT", VIEW: "VIEW", SUMMARY: "SUMMARY" };
export type CropType = "CROP_FROM" | "CROP_AROUND";
export type CropSide = "TOP" | "BOTTOM" | "LEFT" | "RIGHT";
export const DIRECTION = {
  TOP: "TOP",
  BOTTOM: "BOTTOM",
  RIGHT: "RIGHT",
  LEFT: "LEFT"
};

export interface CropSideValues {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface CropFromConfig {
  include_markers_boundary: boolean;
  crop_side_values: CropSideValues;
  crop_side: CropSide;
}

export interface CropAroundConfig {
  position_x: number;
  position_y: number;
  crop_side: CropSideValues;
}

//STEP 1
export interface CropMarkerSize {
  schema: number;
  step: number;
  type: string;
  marker: string;
  crop_type: CropType;
  crop_around_config: CropAroundConfig;
  crop_from_config: CropFromConfig;
  name: string;
  enable_body_parts_detection: boolean | undefined;
}

//STEP 2
export interface RemoveBgConfig {
  schema: number;
  remove_background: boolean;
  background_color: string;
  transparency: number;
  step: number;
  type: string;
  custom_background_image_paths: string[];
}

//STEP 3\
export interface MediaSize {
  width: number;
  height: number;
}

export enum CropConfigNames {
  "ORIGINAL" = "ORIGINAL",
  "CUSTOM_NAME" = "CUSTOM"
}
export interface MediaConversionOptions {
  crop_config_name: CropConfigNames;
  media_size?: MediaSize | null;
  maintain_aspect_ratio: boolean;
  allow_padding: boolean;
}

export interface DownloadConfiguration {
  schema: number;
  media_conversion_options: MediaConversionOptions[];
  step: number;
  type: "DOWNLOAD";
}

export interface BackgroundConfiguration {
  schema: number;
  remove_background: boolean;
  background_color?: string;
  transparency: number;
  step: number;
  type: "BG" | "REMOVE_BG_RESIZE";
  custom_background_image_paths: string[] | undefined;
}

export enum SMART_CROP_TYPE {
  "SMART_CROP" = "SMART_CROP",
  "UNRECOGNIZABLE_CROP" = "UNRECOGNIZABLE_CROP",
  "REMOVE_BG_RESIZE" = "REMOVE_BG_RESIZE"
}

export interface UnrecognizableAutomation {
  name: string;
  type: SMART_CROP_TYPE.UNRECOGNIZABLE_CROP;
}

export interface EditedUnrecognizableAutomation {
  name: string;
  type: SMART_CROP_TYPE.UNRECOGNIZABLE_CROP;
  id: string;
  status: string;
}

export interface CropConfiguration {
  schema: number;
  step: number;
  type: "CROP";
  marker: string;
  crop_type: "CROP_FROM" | "CROP_AROUND";
  crop_around_config: CropAroundConfig;
  crop_from_config: CropFromConfig;
  enable_body_parts_detection: boolean;
}

export interface UnrecognizableCropConfig {
  crop_configuration: CropConfiguration;
  background_configuration: BackgroundConfiguration;
  download_configuration: DownloadConfiguration;
}

export interface CreateUnrecognizableCropConfig {
  automation: UnrecognizableAutomation;
  unrecognizable_crop_configuration: UnrecognizableCropConfig;
}
export interface EditUnrecognizableCropConfig {
  automation: EditedUnrecognizableAutomation;
  unrecognizable_crop_configuration: UnrecognizableCropConfig;
}

export interface JobStartConfiguration {
  automationId: string;
  config: {
    schema: number;
    smart_crop_download_options: {
      media_conversion_options: MediaConversionOptions[];
      allow_padding: boolean;
      padding_color: string;
      transparency: number;
    };
  };
}

//remove bg resize
export interface RemoveBgResizeAutomation {
  name: string;
  type: SMART_CROP_TYPE.REMOVE_BG_RESIZE;
}

export interface RemoveBgResizeConfig {
  background_configuration: BackgroundConfiguration;
  download_configuration: DownloadConfiguration;
}
export interface createRemoveBgResizeConfig {
  automation: RemoveBgResizeAutomation;
  remove_bg_resize_configuration: RemoveBgResizeConfig;
}

export interface EditedRemoveBgResizeAutomation {
  name: string;
  type: SMART_CROP_TYPE.REMOVE_BG_RESIZE;
  id: string;
  status: string;
}
export interface EditRemoveBgResizeConfig {
  automation: EditedRemoveBgResizeAutomation;
  remove_bg_resize_configuration: RemoveBgResizeConfig;
}

// ----------------Custom face crop -------------------

export interface CustomFaceCropAutomation {
  name: string;
  type: SMART_CROP_TYPE.SMART_CROP;
}

export interface CustomFaceCropConfig {
  crop_configuration: CropConfiguration;
  background_configuration: BackgroundConfiguration;
  download_configuration: DownloadConfiguration;
}

export interface CreateCustomFaceCropConfig {
  automation: CustomFaceCropAutomation;
  smart_crop_automation_configuration: CustomFaceCropConfig;
}

export interface EditedCustomFaceCropAutomation {
  name: string;
  type: SMART_CROP_TYPE.SMART_CROP;
  id: string;
  status: string;
}
export interface EditCustomFaceCropConfig {
  automation: EditedCustomFaceCropAutomation;
  smart_crop_automation_configuration: CustomFaceCropConfig;
}

export interface UploadFile extends File {
  uuid?: string;
  preview?: string;
  s3Path?: string;
  path?: string;
  progress?: number;
}

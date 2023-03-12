import { CropStatus } from "../ui-components/enums";
import MediaSize from "../models/MediaSize";
import { CropConfigName } from "../ui-components/smart-crop/select-format/select-format-utils";

export type OBJECT_TYPE = { [key: string]: any };
export type JSON_TYPE = { [key: string]: any };

export type LabelValue = { label: string; value: string };

export type ComponentProp = {
  className?: string;
  children?: React.ReactNode;
};

export type SelectedImage = {
  url: string;
  id: string;
};

// Deprecated
export type RawPhoto = {
  id: string;
  alt: string;
  photographer: string;
  width: number;
  height: number;
  src: {
    tiny: string;
    small: string;
    large: string;
    large2x: string;
    original: string;
  };
};

export type Dimension = {
  width: number;
  height: number;
};

export type Photo = {
  id: string;
  name: string;
  mask?: [number, number, number, number];
  cropStatus?: CropStatus;
  imageUrl?: string;
  thumbnailUrl?: string;
  customBgUrl?: string;
  originImgUrl?: string;
  transparentImgUrl?: string;
  size?: number;
  createdAt?: number;
  lastModified?: number;
  file?: File | null;
  isoDate?: Date;
  errorCode?: string;
  warnCode?: string;
  dimension?: MediaSize;
  cropConfigName?: CropConfigName;
  editUploadPath?: string;
  originalFileName?: string;
  outputWithBgKey?: string;
  customBgKey?: string;
  croppedSignedUrl?: string;
};

export type SmartCropEditUrls = {
  cropId: string;
  imgName: string;
  dimension: MediaSize;
  originalFileName?: string;
  originImgUrl?: string; //"output_with_bg_signed_url": "string",
  outputWithBgKey?: string; //"output_with_bg_key": "string",
  customBgUrl?: string; //"original_custom_bkg_signed_url": "string",
  customBgKey?: string; //"custom_bg_key": "string",
  transparentImgUrl?: string; //"input_bg_removed_signed_url": "string",
  inputWithBgKey?: string; //"input_bg_removed_key": "string",
  editUploadPath?: string; //"edit_upload_path": "string",
  croppedSignedUrl?: string; //"cropped_output_signed_url": "string"
};

export type UploadingPhoto = Photo & {
  percent?: number;
  isUploading?: boolean;
  isThumbGenerated: boolean;
  assetId: string;
};

export type UploadAssetDataFromAPI = {
  upload_path: string;
  asset_id: string;
};
export type UploadFinishAPIResponse = {
  asset_data: AssetData;
  success: boolean;
};

export enum MediaGenerationStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED"
}

export type AssetData = {
  id: string;
  name: string;
  size: number;
  thumb_url: string;
  thumb_generated: MediaGenerationStatus;
  preview_generated: MediaGenerationStatus;
  preview_url: string;
};

export type AssetUploadUrlDataFRomAPI = {
  asset_upload_data: UploadAssetDataFromAPI[];
};

export type CustomModalProps = {
  title?: string;
  okText?: string;
  cancelText?: string;
  onOk?: (e: React.MouseEventHandler<HTMLElement>) => void;
};

export type AssetsForAutomationResponse = {
  entries: AssetData[];
  total: number;
  count: number;
};

export type PlanStatus = {
  start_date: string;
  end_date: string;
};

export enum Platforms {
  amazon = "AMAZON",
  etsy = "ETSY",
  aliexpress = "ALIEXPRESS"
}

export enum QCJobStatus {
  IN_PROGRESS = "IN_PROGRESS",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR"
}

export const platforms = new Map();
platforms.set("amazon", Platforms.amazon);
platforms.set("etsy", Platforms.etsy);
platforms.set("aliexpress", Platforms.aliexpress);

export interface QCJobDetails {
  job_id?: string | null;
  category?: string | null;
  target_type: "URL" | "UPLOAD";
  target_value: string;
  platform_id: Platforms;
  manual_upload?: boolean;
  image_urls?: string[] | null;
}

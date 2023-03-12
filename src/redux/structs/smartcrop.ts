import { SMARTCROP_PREVIEW } from "../../common/Enums";
import { JSON_TYPE, LabelValue, OBJECT_TYPE, Photo, SelectedImage } from "../../common/Types";
import AutomationJob from "../../models/AutomationJob";
import { MarkerData } from "../../models/MarkerData";
import SmartCropAssets from "../../ui-components/components/smart-crop-config/modal/SmartCropAssets";
import { UnitType } from "../../ui-components/enums";

export type SmartCropStructType = {
  preview: SMARTCROP_PREVIEW;
  showMarker: boolean;
  pause: boolean;
  stop: boolean;
  processed: number;
  total: number;
  croppedImgs: Photo[];
  resultsImages: Photo[];
  currentView: string;
  smartCropStatus: string;
  completedDate: Date;
  currentMarker: string;
  selectedMarker: MarkerData;
  cropSide: string;
  cropType: string;
  cropPosition: OBJECT_TYPE;
  cropSize: OBJECT_TYPE;
  isIncludeMarkersBoundary: boolean;
  uploadedMedia: Photo[];
  automationId: number;
  automationJob: AutomationJob;
  latestJobId: string;
  markerOptions: LabelValue[];
  selectedImage: SelectedImage;
  imageIds: string[];
  assets: SmartCropAssets;
  isImageLoaded: boolean;
  automationName: string;
  largePreview: JSON_TYPE | undefined;
  downloadAll: boolean;
  downloadVisible: boolean;
  removeBackground: boolean;
  isUploading: boolean;
};

export const SmartCropStruct: SmartCropStructType = {
  preview: SMARTCROP_PREVIEW.ORIGINAL,
  showMarker: true,
  pause: false,
  stop: false,
  processed: 0,
  total: 0,
  croppedImgs: [],
  currentView: "smartcrop",
  smartCropStatus: "",
  completedDate: new Date(),
  currentMarker: "",
  selectedMarker: new MarkerData(0, 0, 0, 0, UnitType.PERCENTAGE),
  cropSide: "BOTTOM",
  cropType: "",
  cropPosition: { x: 50, y: 50 },
  cropSize: {
    top: 100,
    bottom: 100,
    left: 100,
    right: 100
  },
  isIncludeMarkersBoundary: false,
  uploadedMedia: [],
  automationId: 0,
  automationJob: new AutomationJob(),
  latestJobId: "",
  selectedImage: {
    id: "",
    url: ""
  },
  markerOptions: [],
  imageIds: [],
  assets: new SmartCropAssets([]),
  isImageLoaded: false,
  resultsImages: [],
  automationName: "",
  largePreview: undefined,
  downloadAll: false,
  downloadVisible: false,
  removeBackground: false,
  isUploading: false
};

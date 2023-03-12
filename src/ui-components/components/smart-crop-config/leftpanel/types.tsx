import { DropdownOption } from "./dropdown/dropdown";

export type CropMarkerOption = DropdownOption & {
  label: string;
  value: string | object | number;
};

export type CropTypeProps = {
  onChange: Function;
  updateCropType: Function;
  updateCropSize: Function;
  cropType: string;
  options: CropTypeOption[];
  selected: CropTypeOption | string | number | object;
  coverClass?: any;
  classNames?: any;
  onModeChange: Function;
  selectedMode: string;
  disabled: boolean;
};

export type CropTypeOption = {
  img: string;
  value: string | object;
  label: string;
  subtitle: string;
  bg: string;
};

export type ImageRefState = {
  height: number;
  width: number;
};

export type ImageSizeType = {
  width: string | number;
  height: string | number;
};

export type MultiCropSrcWithHeight = {
  src: string;
  height: string | number;
  crop: any[];
  setImageInfo: Function;
  zoom: number;
  cropInfo: any;
  imageInfo: any;
  markers: AIInfo[] | undefined;
  setIsDrawing: Function;
  setCrop: Function;
  loadCoordinates: Function;
  selectedMarker: AIInfo | undefined;
};

export type PhotoType = {
  name: string;
  description: string;
  src: ImageSrc;
  height: number;
  width: number;
  alt: string;
  id: number;
};
export type ImageSrc = {
  original: string;
};
export type MarkerCoodinates = any;

export type AIInfo = {
  height: number;
  unit: string;
  width: number;
  x: number;
  y: number;
};

export type CropInfoProps = {
  cropType: any;
  selectedMarker: any;
  imageInfo: any;
  cropSize: any;
  cropMarker: any;
  cropPosition: any;
  cropSide: any;
  coordinateInfo: any;
  isIncludeBoundingBox: any;
};

export type Automation = {
  name: string;
  type: string;
};
export type SaveAutomationConfig = {
  automation: Automation;
  smartCropAutomationConfiguration: any;
};

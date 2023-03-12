import { SMART_CROP } from "../../../common/Enums";
import { Logger } from "../../../lib/logger/Logger";
import { AIInfo } from "./leftpanel/types";
import { CreateSmartCropAutomationJob } from "./modal/CreateAutomationJob";
import {
  CreateSmartCrop,
  CropSideType,
  CropTypeConfigCropAround,
  CropTypeConfigCropFrom,
  SmartCropAutomationConfiguration
} from "./modal/CreateSmartCrop";
import { EditSmartAutomationConfig, EditSmartCropConfig, EditSmartSmartCropConfig } from "./modal/EditSmartCrop";
import { CROP_TYPE, DIRECTION } from "./smart-crop-config-constants";
import AutomationItem from "../../../models/AutomationItem";
import { JSON_TYPE } from "../../../common/Types";
const logger = new Logger("ui-components:components:smart-crop-config:smartCropUtil");
export const percentageToPxConvert = (elementWidth: number, percentage: number) => {
  return percentage * elementWidth;
};

export const pixelToPercentageConvert = (width: number, px: number) => {
  return (px * 100) / width;
};

export const getMaxDirectedCoordinate = (direction: string, selectedMarker: any, isIncludeBoundingBox: boolean) => {
  const { height, width, x, y } = selectedMarker;
  switch (direction) {
    case DIRECTION.TOP:
      return { y };
    case DIRECTION.BOTTOM:
      return { y: height + y };
    case DIRECTION.LEFT:
      return { x };
    case DIRECTION.RIGHT:
      return { y: width + x };
    default:
      return null;
  }
};

export const persentageToNumber = (value: string) => {
  return value; //&& Number(value) === NaN ? Number(value.replace('%', '')) : 0;
};

export const getCoordinatesForPosition = (
  selectedMarker: any,
  direction: string,
  isIncludeBoundingBox: boolean,
  imageHeight: number,
  imageWidth: number
) => {
  const { height, width, x, y } = selectedMarker;
  let cordWidth, cordHeight;
  switch (direction) {
    case DIRECTION.TOP:
      cordWidth = convertPercentage(100, imageWidth);
      cordHeight = convertPercentage(isIncludeBoundingBox ? y + height : y, imageHeight);
      return {
        x: 0,
        y: 0,
        height: cordHeight,
        width: cordWidth
      };
    case DIRECTION.BOTTOM:
      cordWidth = convertPercentage(100, imageWidth);
      cordHeight = convertPercentage(y + (isIncludeBoundingBox ? 0 : height), imageHeight);
      return {
        x: 0,
        y: cordHeight,
        height: convertPercentage(100 - (y + (isIncludeBoundingBox ? 0 : height)), imageHeight),
        width: convertPercentage(100, imageWidth)
      };
    case DIRECTION.LEFT:
      cordWidth = convertPercentage(100, imageWidth);
      cordHeight = convertPercentage(y, imageHeight);
      return {
        x: 0,
        y: 0,
        height: convertPercentage(100, imageHeight),
        width: convertPercentage(x + (isIncludeBoundingBox ? width : 0), imageWidth)
      };
    case DIRECTION.RIGHT:
      cordWidth = convertPercentage(isIncludeBoundingBox ? x : x + width, imageWidth);
      cordHeight = convertPercentage(100, imageHeight);
      return {
        x: cordWidth,
        y: 0,
        height: convertPercentage(100, imageHeight),
        width: convertPercentage(isIncludeBoundingBox ? 100 - x : 100 - (x + width), imageWidth)
      };
    default:
      return null;
  }
};

export const isCropAllow = (
  coordinate: any,
  index: number,
  crops: any,
  imageInfo: any,
  cropInfo: any,
  selectedMarker: AIInfo | undefined
) => {
  // if (crops.length - 1 < index) {
  //   if(cropInfo.cropType === CROP_TYPE.CROP_FROM && index > 0) return false;
  //   if(cropInfo.cropType === CROP_TYPE.CROP_AROUND && crops.length - 1 < index) return false;
  // }
  if (coordinate.height === 0 && coordinate.width === 0) return false;
  //Check Crop Around with Existing Crop

  //Crop Limit Within Image Area
  if (
    coordinate.x < 0 ||
    coordinate.y < 0 ||
    coordinate.x + coordinate.width > imageInfo.width ||
    coordinate.y + coordinate.height > imageInfo.height
  ) {
    return false;
  }

  //Crop From Validation
  if (cropInfo.cropType === CROP_TYPE.CROP_FROM) {
    if (index > 0) return false;
    const markerInfo = getMarkerInfo(selectedMarker, imageInfo.height, imageInfo.width);
    if (markerInfo) {
      switch (cropInfo.cropSide) {
        case DIRECTION.TOP:
          return getTopMaxCropFrom(coordinate, markerInfo, cropInfo);
        case DIRECTION.BOTTOM:
          return getBottomMaxCropFrom(coordinate, markerInfo, cropInfo);
        case DIRECTION.LEFT:
          return getLeftMaxCropFrom(coordinate, markerInfo, cropInfo);
        case DIRECTION.RIGHT:
          return getRightMaxCropFrom(coordinate, markerInfo, cropInfo);
        default:
          break;
      }
    }
  }
  if (cropInfo.cropType === CROP_TYPE.CROP_AROUND) {
    const markerAtZero: AIInfo = crops?.length ? crops[index] : null;
    if (!markerAtZero) return false;
    const left = percentageToPxConvert(imageInfo.width, markerAtZero.x);
    const top = percentageToPxConvert(imageInfo.height, markerAtZero.y);
    const right = percentageToPxConvert(imageInfo.width, markerAtZero.x + markerAtZero.width);
    const bottom = percentageToPxConvert(imageInfo.height, markerAtZero.y + markerAtZero.height);
    if (coordinate.x < left) return false; //LEFT
    if (coordinate.y < top) return false; //TOP
    if (coordinate.x + coordinate.width < right) return false; //RIGHT
    if (coordinate.y + coordinate.height < bottom) return false; //BOTTOM
  }
  return true;
};

export const getAroundCropCoordinates = (marker: AIInfo, position: any, imageHeight: number, imageWidth: number) => {
  const { x, y, width, height } = marker;
  const posX = 0; //x - position.x;
  const posY = 0; //y - position.y;
  return {
    height: convertPercentage(height, imageHeight) + 20,
    width: convertPercentage(width, imageWidth) + 20,
    x: convertPercentage(x + posX, imageWidth) - 20,
    y: convertPercentage(y + posY, imageHeight) - 20
  };
};

export const convertPercentage = (value: number, heightWidth: number) => {
  return percentageToPxConvert(heightWidth, value);
};

export const getPercentage = (value: number, heightWidth: number) => {
  return (value / heightWidth) * 100;
};

export const parseCropCoordinates = (coordinate: any, index: number, coordinates: any[], cropInfo: any) => {
  if (cropInfo.cropType === CROP_TYPE.CROP_AROUND) {
    const diffx = coordinate.x - coordinates[index].x;
    const diffy = coordinate.y - coordinates[index].y;
    const diffHeight = 0; //coordinate.height - coordinates[index].height;
    const diffWidth = 0; //coordinate.width - coordinates[index].width;

    coordinates.forEach(e => {
      e.x = e.x + diffx;
      e.y = e.y + diffy;
      e.width = e.width + diffWidth;
      e.height = e.height + diffHeight;
    });
    return [...coordinates];
  } else {
    return coordinates;
  }
};

export const getTopMaxCropFrom = (current: any, marker: any, cropInfo: any) => {
  if (cropInfo.isIncludeBoundingBox) {
    return marker.y + marker.height >= current.y + current.height;
  } else {
    return marker.y >= current.y + current.height;
  }
};
export const getBottomMaxCropFrom = (current: any, marker: any, cropInfo: any) => {
  if (cropInfo.isIncludeBoundingBox) {
    return current.y >= marker.y;
  } else {
    return current.y >= marker.y + marker.height;
  }
};
export const getLeftMaxCropFrom = (current: any, marker: any, cropInfo: any) => {
  if (cropInfo.isIncludeBoundingBox) {
    return current.x <= marker.x + marker.width && current.x + current.width < marker.x + marker.width;
  } else {
    return current.x <= marker.x && current.x + current.width < marker.x;
  }
};
export const getRightMaxCropFrom = (current: any, marker: any, cropInfo: any) => {
  if (cropInfo.isIncludeBoundingBox) {
    return current.x >= marker.x;
  } else {
    return current.x >= marker.x + marker.width;
  }
};

const getMarkerInfo = (marker: any, imageHeight: number, imageWidth: number): AIInfo | null => {
  if (marker) {
    return {
      x: percentageToPxConvert(imageWidth, marker.x),
      y: percentageToPxConvert(imageHeight, marker.y),
      height: percentageToPxConvert(imageHeight, marker.height),
      width: percentageToPxConvert(imageWidth, marker.width),
      unit: "px"
    };
  }
  return null;
};

export const getMarkerInputValue = (
  cropType: string,
  coordinates: AIInfo[],
  markerInfo: any,
  selectedMarker: AIInfo,
  imageInfo: any
) => {
  let left: number = 0,
    right: number = 0,
    top: number = 0,
    bottom = 0,
    x = 0,
    y = 0;
  if (cropType === CROP_TYPE.CROP_FROM) {
    const coordinate = coordinates.length ? coordinates[0] : null;
    if (coordinate) {
      left = pixelToPercentageConvert(imageInfo.width, coordinate.x);
      top = pixelToPercentageConvert(imageInfo.height, coordinate.y);
      right = pixelToPercentageConvert(imageInfo.width, imageInfo.width - coordinate.x);
      bottom = pixelToPercentageConvert(imageInfo.height, imageInfo.height - (coordinate.y + coordinate.height));
      x = left;
      y = right;
    }
  }
  if (cropType === CROP_TYPE.CROP_AROUND) {
    const coordinate = coordinates.length ? coordinates[0] : null;
    if (coordinate) {
      left = pixelToPercentageConvert(imageInfo.width, coordinate.x);
      top = pixelToPercentageConvert(imageInfo.height, coordinate.y);
      right = pixelToPercentageConvert(imageInfo.width, imageInfo.width - coordinate.x);
      bottom = pixelToPercentageConvert(imageInfo.height, imageInfo.height - (coordinate.y + coordinate.height));
      x = left;
      y = right;
    }
  }
  return {
    left: Math.floor(left),
    right: Math.floor(right),
    top: Math.floor(top),
    bottom: Math.floor(bottom),
    x: Math.floor(x),
    y: Math.floor(y)
  };
};

const searchRegExp = /_/g;
const replaceWith = " ";

function lowerAndreplaceWidth(str: string) {
  if (!str) return "";

  return str.toLowerCase().replace(searchRegExp, replaceWith);
}

const generateConfigName = (cropType: string, cropSide: string, marker: string, position: number) => {
  //TODO: improve implementation later @John
  const type = lowerAndreplaceWidth(cropType);
  const side = lowerAndreplaceWidth(cropSide);
  const mark = lowerAndreplaceWidth(marker);
  let name: string = "";

  if (cropType === CROP_TYPE.CROP_FROM) {
    name = `Smart ${type} ${position}% ${side} of ${mark}`;
  }
  if (cropType === CROP_TYPE.CROP_AROUND) {
    name = `Smart crop ${position}% around ${mark}`;
  }
  return name;
};

const getCropPosition = (cropInfo: any) => {
  const { cropSize, cropSide } = cropInfo;
  let position = 0;
  switch (cropSide) {
    case DIRECTION.TOP:
      position = cropSize.bottom;
      break;
    case DIRECTION.RIGHT:
      position = cropSize.left;
      break;
    case DIRECTION.BOTTOM:
      position = cropSize.top;
      break;
    case DIRECTION.LEFT:
      position = cropSize.right;
      break;
    default:
      return position;
  }
  return Math.ceil(position);
};

export interface CropInfoPayload {
  cropType: "crop_around" | "crop_from";
  cropSide: "top" | "right" | "bottom" | "left";
  cropMarker: "nose" | "mouth" | "eyes" | "face" | "between eyes and nose" | "between nose and mouth";
  cropSize: JSON_TYPE;
  cropPosition: JSON_TYPE;
  isIncludeBoundingBox: boolean;
  removeBackground: boolean;
}

export const createSaveConfigPayload = (cropInfo: CropInfoPayload) => {
  const position: number = getCropPosition(cropInfo);
  const name: string = generateConfigName(cropInfo.cropType, cropInfo.cropSide, cropInfo.cropMarker, position);

  //CropSideType
  const cropSideType = new CropSideType();
  cropSideType.top = cropInfo?.cropSize?.top;
  cropSideType.left = cropInfo?.cropSize?.left;
  cropSideType.bottom = cropInfo?.cropSize?.bottom;
  cropSideType.right = cropInfo?.cropSize?.right;
  //CropAround
  const crop_around = new CropTypeConfigCropAround();
  crop_around.crop_side = cropSideType;
  crop_around.position_x = cropInfo?.cropPosition?.x;
  crop_around.position_y = cropInfo?.cropPosition?.y;
  //CropFrom
  const crop_from = new CropTypeConfigCropFrom();
  crop_from.include_markers_boundary = cropInfo?.isIncludeBoundingBox;
  crop_from.crop_side_values = cropSideType;
  crop_from.crop_side = cropInfo?.cropSide;

  //SmartCropAutomationConfiguration
  const configuration = new SmartCropAutomationConfiguration();
  configuration.schema = 1;
  configuration.marker = cropInfo?.cropMarker;
  configuration.crop_type = cropInfo?.cropType;
  configuration.crop_around_config = crop_around;
  configuration.crop_from_config = crop_from;
  configuration.remove_background = cropInfo?.removeBackground;

  console.log("automation name", name);
  const smartCropAutomation = new AutomationItem();
  smartCropAutomation.setName(name);
  smartCropAutomation.setType(SMART_CROP.TYPE);

  const createSmartCrop = new CreateSmartCrop();
  createSmartCrop.automation = smartCropAutomation;
  createSmartCrop.smart_crop_automation_configuration = configuration;

  logger.log({ createSmartCrop });
  return createSmartCrop;
};

export const editConfigPayload = (cropInfo: CropInfoPayload, id: string) => {
  //CropSideType
  const cropSideType = new CropSideType();
  cropSideType.top = cropInfo?.cropSize?.top;
  cropSideType.left = cropInfo?.cropSize?.left;
  cropSideType.bottom = cropInfo?.cropSize?.bottom;
  cropSideType.right = cropInfo?.cropSize?.right;
  //CropAround
  const crop_around = new CropTypeConfigCropAround();
  crop_around.crop_side = cropSideType;
  crop_around.position_x = cropInfo?.cropPosition?.x;
  crop_around.position_y = cropInfo?.cropPosition?.y;
  //CropFrom
  const crop_from = new CropTypeConfigCropFrom();
  crop_from.include_markers_boundary = cropInfo?.isIncludeBoundingBox;
  crop_from.crop_side_values = cropSideType;
  crop_from.crop_side = cropInfo?.cropSide;

  const automation = new EditSmartAutomationConfig();
  automation.id = id;
  automation.type = "SMART_CROP";
  automation.status = "CONFIGURED";

  const smartCropConfig = new EditSmartSmartCropConfig();
  smartCropConfig.schema = 1;
  smartCropConfig.marker = cropInfo?.cropMarker;
  smartCropConfig.crop_type = cropInfo?.cropType;
  smartCropConfig.crop_around_config = crop_around;
  smartCropConfig.crop_from_config = crop_from;
  smartCropConfig.remove_background = cropInfo?.removeBackground;

  const editSmartCrop = new EditSmartCropConfig();
  editSmartCrop.automation = automation;
  editSmartCrop.smart_crop_automation_configuration = smartCropConfig;
  logger.log({ editSmartCrop });
  return editSmartCrop;
};

export const smartCropJobAutomationPayload = (id: number) => {
  const automationJob = new CreateSmartCropAutomationJob();
  automationJob.job_name = `Automation Job #${id}`;
  automationJob.job_definition = "CROP";
  automationJob.job_executor = "SMART_CROP";
  automationJob.automation_id = id;
  return automationJob;
};

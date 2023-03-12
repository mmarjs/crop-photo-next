import { EventEmitter } from "eventemitter3";
import { AIInfo } from "../leftpanel/types";

// Temp Storage of Recent Changed Crop Data
export default class CropDataSharing {
  static coordinates: AIInfo[];
}

export const cropDropEvent = new EventEmitter();
export const cropSizeEvent = new EventEmitter();

export const CROP_EVENTS = {
  ON_DROP_COMPLATE: "ON_DROP_COMPLATE",
  CROP_SIZE_CHANGE: "CROP_SIZE_CHANGE"
};

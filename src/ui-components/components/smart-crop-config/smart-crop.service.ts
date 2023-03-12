import API from "../../../util/web/api";
import { CreateSmartCrop } from "./modal/CreateSmartCrop";
import { EditSmartCropConfig } from "./modal/EditSmartCrop";

export const saveAutomationConfig = (payload: CreateSmartCrop) => {
  return API.createAutomationConfig(payload);
};

export const editAutomationConfig = (payload: EditSmartCropConfig) => {
  return API.editAutomationConfig(payload);
};

export const getAutomationConfig = (id: string, includeConfig: boolean = true, includeJobIds: boolean = true) => {
  return API.getAutomation(id, { config: includeConfig, jobIds: includeJobIds });
};

import { UploadFile } from "antd/lib/upload/interface";
import { Photo } from "../../common/Types";

export const UPDATE_TOTAL_FILES = "UPDATE_TOTAL_FILES";

export const updateTotalFiles = (files: UploadFile<Photo>[]) => ({
  type: UPDATE_TOTAL_FILES,
  payload: files
});

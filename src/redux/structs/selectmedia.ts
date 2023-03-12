import { UploadFile } from "antd/lib/upload/interface";
import { Photo } from "../../common/Types";

export type SelectMediaStructType = {
  files: UploadFile<Photo>[];
};

export const SelectMediaStruct: SelectMediaStructType = {
  files: []
};

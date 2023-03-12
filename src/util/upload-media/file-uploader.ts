//@ts-nocheck
import {FileUploaderData} from "./file-uploader-helper";
import {UploadItem} from "../../common/Classes";
import {JSON_TYPE, UploadAssetDataFromAPI} from "../../common/Types";
import API from "../web/api";
import {ActiveUpload, UploadAndSaveFileToDB} from "./single-file-uploader";
import {HttpResultType} from "../web/http-client";
////todo: @Achin, these needs to be configurable.
const MAX_PARTS = 10000;
const DEFAULT_PART_SIZE = 10 * 1024 * 1024;

/*const putObjectUsingStorageAPI = async (uploadItem, assetDataFromAPI, reporter) => {
  try {

    let completeCallbackEvent = event => {
      console.log(`Successfully uploaded ${event.key} and file name ${uploadItem.getName()}`);
      reporter?.onUploadFinish(uploadItem, assetDataFromAPI);
    };
    let progressCallback = progress => {
      console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
      let calculatedProgress = progress.loaded / progress.total;
      reporter?.onProgress(uploadItem, calculatedProgress);
    };
    let errorCallback = err => {
      console.error("Unexpected error while uploading", err);
    };

    let uploadTask = Storage.put(assetDataFromAPI.upload_path, uploadItem.getFile(), {
      customPrefix: {
        public: ""
      },
      completeCallbackEvent: completeCallbackEvent,
      progressCallback: progressCallback,
      errorCallback: errorCallback,
      resumable: false // (Boolean) Allows uploads to be paused and resumed
    });
    reporter?.onUploadStart(uploadItem, assetDataFromAPI, uploadTask);
    const result = await uploadTask;
    reporter?.onUploadFinish(uploadItem, assetDataFromAPI);
    //console.log("uploadResult pushed to array");
  } catch (err) {
    console.log("some error in storage.put method  ", err.toString());
  }
};*/
export const uploadThroughAWSAmplify = (
  fileUploaderData: FileUploaderData,
  pathArray: Array<JSON_TYPE>
): Map<string, ActiveUpload> => {
  let fileList = fileUploaderData.selectedFiles;
  const uploadIdToActiveUploads: Map<string, ActiveUpload> = new Map();
  if (fileList && fileList.length > 0) {
    for (let i = 0; i < fileList.length; i++) {
      let uploadItem: UploadItem = fileList[i];
      let jsontype: JSON_TYPE = pathArray[i];
      const uploadAndSaveFileToDB = new UploadAndSaveFileToDB(
        {
          automationId: fileUploaderData.automationId,
          uploadItem: uploadItem,
          assetDataFromAPI: jsontype
        },
        fileUploaderData.uploadReporter
      );
      uploadAndSaveFileToDB.run();
      uploadIdToActiveUploads.set(uploadItem.getUiId(), uploadAndSaveFileToDB);
      //putObjectUsingStorageAPI(uploadItem, jsontype, reporter);
    }
  }
  return uploadIdToActiveUploads;
};
/**
 * get filePromise: an array of promise  for upload call of each file
 * @param assetUploadDataList
 * @param fileUploaderData
 */
const getFilePromises = (assetUploadDataList: UploadAssetDataFromAPI[], fileUploaderData: FileUploaderData) => {
  let filePromises = [];
  if (assetUploadDataList && assetUploadDataList.length == fileUploaderData.selectedFiles.length) {
    for (let i = 0; i < fileUploaderData.selectedFiles.length; i++) {
      const addConfig = getFileConfig(fileUploaderData.selectedFiles[i], assetUploadDataList[i], fileUploaderData);
      const overrides = getFileConfigOverrides(fileUploaderData.selectedFiles[i]);
      let promise = fileUploaderData.evaporateObj.add(addConfig, overrides).then(
        awsObjectKey => {
          console.log(fileUploaderData.selectedFiles[i].getName() + "  is  successfully uploaded to:", awsObjectKey);
        },
        reason => console.log("File did not upload successfully:", reason)
        //Todo: @Achin, We need to capture the reason and propagate reason to Controller, so that it can be processed.
      );
      filePromises.push(promise);
    }
  } else {
    //Todo: @Achin, not handling of else case??? Who is going to use this console log. What's the use of it.
    console.log("upload url path not found for the list of files.Please check in upload-data API");
  }
  return filePromises;
};
/**
 * Method to get evaporate config params of file for upload to S3
 * @param uploadItem
 * @param assetUploadData
 * @param fileUploaderData
 * @returns addConfig
 */
const getFileConfig = (
  uploadItem: UploadItem,
  assetUploadData: UploadAssetDataFromAPI,
  fileUploaderData: FileUploaderData
) => {
  uploadItem.setId(assetUploadData.asset_id);
  return {
    name: assetUploadData.upload_path,
    file: uploadItem.getFile(),
    started: key => {
      fileUploaderData.uploadReporter?.onUploadStart(uploadItem, assetUploadData, key);
    },
    complete: () => {
      fileUploaderData.uploadReporter?.onUploadFinish(uploadItem, assetUploadData);
    },
    progress: (progressValue: number) => {
      fileUploaderData.uploadReporter?.onProgress(uploadItem, progressValue);
    },
    cancelled: item => {
      fileUploaderData.uploadReporter?.onUploadCancel(uploadItem);
    }
  };
};
/**
 * Method to get evaporate config params overrides of file for upload to S3
 * @return overrides
 * @param uploadItem
 */
const getFileConfigOverrides = (uploadItem: UploadItem) => {
  let calculatedPartSize = uploadItem.getFile().size / MAX_PARTS;
  let partSize = DEFAULT_PART_SIZE;
  if (calculatedPartSize > DEFAULT_PART_SIZE) {
    partSize = Math.ceil(calculatedPartSize);
  }
  return {
    partSize: partSize
  };
};
/**
 * Method for upload selected files on S3
 * @param fileUploaderData
 */
const uploadFiles: (fileUploaderData: FileUploaderData) => Promise<Map<string, ActiveUpload>> = (
  fileUploaderData: FileUploaderData
) => {
  return API.getUploadUrl(fileUploaderData.selectedFiles.length).then(
    (response: HttpResultType) => {
      return uploadThroughAWSAmplify(fileUploaderData, response.data.asset_upload_data);
      /*   let filePromises = getFilePromises(response.data.asset_upload_data, fileUploaderData);
        let allCompleted = Promise.all(filePromises).then(
          function () {
            fileUploaderData.uploadReporter?.onAllTheUploadFinished();
          },
          function (reason) {
            console.log("File upload for all files not completed: " + reason);
          }
        ); */
    },
    error => {
      console.log("Some error to fetch upload url from server. " + error);
      return error;
    }
  );
};
/**
 * Method for upload edited images on S3
 * @param fileUploaderData
 */
// const uploadEditedImg: (fileUploaderData: FileUploaderData) => Promise<Map<string, ActiveUpload>> = (
//   fileUploaderData: FileUploaderData
// ) => {
//   return API.getEditedImgUploadUrl(fileUploaderData).then(
//     (response: HttpResultType) => {
//       return uploadThroughAWSAmplify(fileUploaderData, response.data.asset_upload_data);
//     },
//     error => {
//       console.log("Some error to fetch upload url from server. " + error);
//       return error;
//     }
//   );
// };
/**
 * Uploader  method for upload selected files on S3
 * @param fileUploaderData
 */
export const fileUploader: (fileUploaderData: FileUploaderData) => Promise<Map<string, ActiveUpload>> = (
  fileUploaderData: FileUploaderData
) => {
  return uploadFiles(fileUploaderData);
  /*   if (fileUploaderData.evaporateObj) {
    uploadFiles(fileUploaderData);
  } else {
    CreateEvaporateObj(awsConfig).then(evaporate => {
      fileUploaderData.evaporateObj = evaporate;
      uploadFiles(fileUploaderData);
    });
  } */
};

// export const editedImgUploader: (editedImgData: FileUploaderData) => Promise<Map<string, ActiveUpload>> = (
//   editedImgData: FileUploaderData
// ) => {
//   return uploadEditedImg(editedImgData);
// };

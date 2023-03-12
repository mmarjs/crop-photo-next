import { useMutation } from "@tanstack/react-query";
import { Storage } from "aws-amplify";
import { OBJECT_TYPE } from "../../../../common/Types";
import API from "../../../../util/web/api";

export function usePostCreateUnrecognizableCropConfig(options: OBJECT_TYPE) {
  return useMutation(API.createUnrecognizableCrop, options);
}

export function useUpdateUnrecognizableCropConfig(options: OBJECT_TYPE) {
  return useMutation(API.editUnrecognizableCrop, options);
}

export function useStartUnrecognizableCropAutomation(options: OBJECT_TYPE) {
  return useMutation(API.startUnrecognizableCropAutomation, options);
}

export function useUploadCustomBg() {
  return useMutation({
    mutationFn: async (acceptedFiles: File[]) => {
      try {
        const response = await API.getBgImageUploadUrl(acceptedFiles.length);
        console.log("response:", response);

        if (!response) {
          throw new Error("response error: " + JSON.stringify(response));
        }
        for (let i = 0; i < response.data.length; i++) {
          const res = response.data[i];
          const url = res.upload_path;
          const uuid = res.uuid;
          console.log("upload url and uuid:", uuid, url);
        }
        //   const bgImageResponse = await Promise.all([
        //     ...response.data.map(res => {
        //       return new Promise((resolve, reject) => {
        //         const url = res.upload_path;
        //         const uuid = res.uuid;
        //         // const config = {
        //         //   progressCallback: handleUploadProgress,
        //         //   completeCallback: handleCompleteUpload,
        //         //   errorCallback: handleErrorUpload,
        //         //   customPrefix: {
        //         //     public: ""
        //         //   },
        //         //   resumable: false
        //         // };
        //         // return await Storage.put(url, acceptedFiles[index], config);
        //         // await API.getBgImageUploadFinished(uuid);
        //       });
        //     })
        //   ]);
        //   const bgImages = await API.getBgImageThumbnail(uuid);
        //   console.log("bgImages:", bgImages);
        //   const bgImageData = bgImages?.data[0] || null;
        //   if (bgImageData) {
        //     console.log("bgImageData:", bgImageData);
        //     const s3Path = bgImageData.signed_preview_s3_path;
        //     console.log("s3Path:", s3Path);
        //     setS3CustomImagePath(s3Path);
        //   }
      } catch (error) {
        console.error("getUploadUrl error", error);
      }
    }
  });
}

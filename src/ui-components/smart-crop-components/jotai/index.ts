import { CheckboxOptionType } from "antd";
import { float } from "aws-sdk/clients/lightsail";
import { atom, useAtom } from "jotai";
import { focusAtom } from "jotai/optics";
import { atomWithReset, useResetAtom } from "jotai/utils";
import { JSON_TYPE, OBJECT_TYPE, Photo, SmartCropEditUrls } from "../../../common/Types";
import { MarkerData } from "../../../models/MarkerData";
import { ImageSizeType } from "../../components/smart-crop-config/leftpanel/types";
import SmartCropAssets from "../../components/smart-crop-config/modal/SmartCropAssets";
import {
  CropMarkerSize,
  defaultRemoveBgConfig,
  defaultSizeConfig,
  defaultUnrecCropConfig,
  RemoveBgConfig,
  DownloadConfiguration
} from "./atomTypes";

export type SampleCropImage = {
  id: string;
  signed_s3_url: string;
  s3_url?: string;
};

export const selectedSampleCropImage = atomWithReset<SampleCropImage | undefined>(undefined);
export const useSelectedSampelCropImage = () => {
  return useAtom(selectedSampleCropImage);
};

export const isOnLargePreview = atomWithReset<boolean>(false);
const updateLargePreview = atom(
  get => get(isOnLargePreview),
  (_get, set, isOnPreview: boolean) => set(isOnLargePreview, isOnPreview)
);
export const useIsOnLargePreview = () => useAtom(updateLargePreview);

const isOpenEditPanel = atomWithReset<boolean>(false);
const updateIsOpenEditPanel = atom(
  get => get(isOpenEditPanel),
  (_get, set, isOpenEdit: boolean) => set(isOpenEditPanel, isOpenEdit)
);
export const useIsOpenEditPanel = () => useAtom(updateIsOpenEditPanel);

const previewMode = atom<boolean>(false);
export const usePreviewMode = () => {
  return useAtom(previewMode);
};

export const customSmartCropAutomationName = atomWithReset<string>("Untitled Custom Face Crop");
const updateCustomSmartCropAutomationName = atom(
  get => get(customSmartCropAutomationName),
  (_get, set, newName: string) => set(customSmartCropAutomationName, newName)
);
export const useCustomSmartCropAutomationName = () => useAtom(updateCustomSmartCropAutomationName);
export const useResetCustomSmartCropAutomationName = () => useResetAtom(customSmartCropAutomationName);

// STEP 1
const configChanges = atomWithReset<number>(0);
const updateNumberOfConfigChanges = atom(
  get => get(configChanges),
  (get, set) => set(configChanges, get(configChanges) + 1)
);
export const useUpdateConfigChanges = () => useAtom(updateNumberOfConfigChanges);
export const useResetUpdateConfigChanges = () => useResetAtom(configChanges);

export const cropMarkerSize = atomWithReset<CropMarkerSize>(defaultUnrecCropConfig);
export const useCropMarkerSize = () => {
  return useAtom(cropMarkerSize);
};

const cropMarker = focusAtom(cropMarkerSize, optic => optic.prop("marker"));
export const useCropMarker = () => {
  return useAtom(cropMarker);
};

const cropArea = focusAtom(cropMarkerSize, optic => optic.prop("crop_from_config").prop("crop_side_values"));
export const useCropArea = () => useAtom(cropArea);

const cropAreaAround = focusAtom(cropMarkerSize, optic => optic.prop("crop_around_config").prop("crop_side"));
export const useCropAreaAround = () => useAtom(cropAreaAround);

const bodyPartDetection = focusAtom(cropMarkerSize, optic => optic.prop("enable_body_parts_detection"));
export const useBodyPartDetection = () => useAtom(bodyPartDetection);

//STEP 2
export const removeBgConfig = atomWithReset<RemoveBgConfig>(defaultRemoveBgConfig);
export const useRemoveBgConfig = () => useAtom(removeBgConfig);
export const useResetBgConfig = () => useResetAtom(removeBgConfig);

const removeBackground = focusAtom(removeBgConfig, optic => optic.prop("remove_background"));
export const useRemoveBackground = () => useAtom(removeBackground);

const backgroundColor = focusAtom(removeBgConfig, optic => optic.prop("background_color"));
export const useBackgroundColor: () => [string, (update: string) => void] = () => useAtom(backgroundColor);

const transparency = focusAtom(removeBgConfig, optic => optic.prop("transparency"));
export const useTransparency = () => useAtom(transparency);

const customBackgroundPaths = focusAtom(removeBgConfig, optic => optic.prop("custom_background_image_paths"));
export const useCustomBackgroundPaths = () => useAtom(customBackgroundPaths);

//STEP 3
export const sizeConfig = atomWithReset<DownloadConfiguration>(defaultSizeConfig);
export const useSizeConfig = () => useAtom(sizeConfig);

const selectedSize = atomWithReset<Array<string>>([]);
export const useSelectedSize = () => useAtom(selectedSize);
export const useResetSelectedSizes = () => useResetAtom(selectedSize);

export const latestCustomSize = atomWithReset<Array<string>>([]);
export const useLatestCustomSize = () => useAtom(latestCustomSize);

//Right Panel ImageViewer
const isSelectedImageLoaded = atom(false);
const updateSelectedImageLoadingStatus = atom(
  get => get(isSelectedImageLoaded),
  (get, set, isLoaded: boolean) => {
    set(isSelectedImageLoaded, isLoaded);
  }
);
export const useUpdateSelectedSampleImageStatus = () => useAtom(updateSelectedImageLoadingStatus);

const imageSize = atom<ImageSizeType>({
  width: 100,
  height: 100
});
const updateImageSize = atom(
  get => get(imageSize),
  (get, set, newImageSize: ImageSizeType) => {
    set(imageSize, newImageSize);
  }
);
export const useUpdateImageSize = () => useAtom(updateImageSize);

const imageInfo = atom<OBJECT_TYPE>({});
const updateImageInfo = atom(
  get => get(imageInfo),
  (get, set, newImageInfo: OBJECT_TYPE) => set(imageInfo, newImageInfo)
);
export const useUpdateImageInfo = () => useAtom(updateImageInfo);

const cropInfo = atom<OBJECT_TYPE>({});
const updateCropInfo = atom(
  get => get(cropInfo),
  (get, set, newCropInfo: OBJECT_TYPE) => set(cropInfo, newCropInfo)
);
export const useUpdateCropInfo = () => useAtom(updateCropInfo);

const assets = atom<SmartCropAssets>(new SmartCropAssets([]));
const updateAssets = atom(
  get => get(assets),
  (get, set, newAssets: SmartCropAssets) => set(assets, newAssets)
);
export const useUpdateAssets = () => useAtom(updateAssets);

const markers = atom<MarkerData[]>([]);
const updateMarkers = atom(
  get => get(markers),
  (get, set, newMarkers: MarkerData[]) => set(markers, newMarkers)
);
export const useUpdateMarkers = () => useAtom(updateMarkers);

const selectedMarker = atom<MarkerData | undefined>(undefined);
const updateSelectedMarker = atom(
  get => get(selectedMarker),
  (get, set, newSelectedMarker: MarkerData) => set(selectedMarker, newSelectedMarker)
);
export const useUpdateSelectedMarker = () => useAtom(updateSelectedMarker);

const cropSize = atom<OBJECT_TYPE>({
  top: 100,
  bottom: 100,
  left: 100,
  right: 100
});
const updateCropSize = atom(
  get => get(cropSize),
  (get, set, newCropSize: OBJECT_TYPE) => set(cropSize, newCropSize)
);
export const useUpdateCropSize = () => useAtom(updateCropSize);

const customSizes = atom<CheckboxOptionType[]>([]);
const updateCustomSizes = atom(
  get => get(customSizes),
  (_, set, newCustomSizes: CheckboxOptionType[]) => set(customSizes, newCustomSizes)
);
export const useUpdateCustomSizes = () => useAtom(updateCustomSizes);

//from redux
//Stepper

//latestJobId
const latestJobIdAtom = atomWithReset<string>("");
const updateLatestJobIdAtom = atom(
  get => get(latestJobIdAtom),
  (_, set, jobId: string) => set(latestJobIdAtom, jobId)
);
export const useUpdateLatestJobId = () => useAtom(updateLatestJobIdAtom);
export const useResetLatestJobId = () => useResetAtom(latestJobIdAtom);

//uploadedAssetsCount
const uploadAssetsCount = atom<number>(0);
const updateUploadAssetsCount = atom(
  get => get(uploadAssetsCount),
  (_, set, count: number) => set(uploadAssetsCount, count)
);
export const useUploadAssetsCount = () => useAtom(updateUploadAssetsCount);

//smartCropTotal
const totalAssetCount = atom<number>(0);
const updateTotalAssetCount = atom(
  get => get(totalAssetCount),
  (_, set, total: number) => set(totalAssetCount, total)
);
export const useTotalAssetCount = () => useAtom(updateTotalAssetCount);

//Right Panel
//uploadedMedia
const uploadedMedia = atom<Photo[]>([]);
const updateUploadedMedia = atom(
  get => get(uploadedMedia),
  (_, set, newUploadedMedia: Photo[]) => set(uploadedMedia, newUploadedMedia)
);
export const useUploadedMedia = () => useAtom(updateUploadedMedia);

//face crop status
const automationStatus = atom<string>("");
const updateAutomationStatus = atom(
  get => get(automationStatus),
  (_, set, newStatus: string) => set(automationStatus, newStatus)
);
export const useAutomationStatus = () => useAtom(updateAutomationStatus);

//isUploading
const isUploadingAssets = atom<boolean>(false);
const updateIsUploadingAssets = atom(
  get => get(isUploadingAssets),
  (_, set, isUploading: boolean) => set(isUploadingAssets, isUploading)
);
export const useIsUploadingAssets = () => useAtom(updateIsUploadingAssets);

//addCroppedImages
const croppedImages = atom<Photo[]>([]);
const updateCroppedImages = atom(
  get => get(croppedImages),
  (_, set, images: Photo[]) => set(croppedImages, images)
);
export const useCroppedImages = () => useAtom(updateCroppedImages);

//downloadAll
const downloadAllAtom = atom<boolean>(false);
const updateDownloadAll = atom(
  get => get(downloadAllAtom),
  (_, set, downloadAll: boolean) => set(downloadAllAtom, downloadAll)
);
export const useDownloadAll = () => useAtom(updateDownloadAll);

//largePreview
const largePreviewAtom = atom<JSON_TYPE | undefined>(undefined);
const updateLargePreviewData = atom(
  get => get(largePreviewAtom),
  (_, set, largePreview: JSON_TYPE | undefined) => set(largePreviewAtom, largePreview)
);
export const useLargePreviewData = () => useAtom(updateLargePreviewData);

//editImage
const editImageAtom = atom<SmartCropEditUrls>({} as SmartCropEditUrls);
const updateEditImage = atom(
  get => get(editImageAtom),
  (_, set, urls: SmartCropEditUrls) => set(editImageAtom, urls)
);
export const useEditImage = () => useAtom(updateEditImage);

//imageIds
const imageIdsAtom = atomWithReset<string[]>([]);
const updateImageIdsAtom = atom(
  get => get(imageIdsAtom),
  (_, set, imageIds: string[]) => set(imageIdsAtom, imageIds)
);
export const useImageIds = () => useAtom(updateImageIdsAtom);
export const useResetImageIds = () => useResetAtom(imageIdsAtom);

const brushType = atom<number>(3);
const updateBrushType = atom(
  get => get(brushType),
  (_, set, isErase: number) => set(brushType, isErase)
);
export const useBrushType = () => useAtom(updateBrushType);

const cursorSize = atom<number>(20);
const updateCursorSize = atom(
  get => get(cursorSize),
  (_, set, size: number) => set(cursorSize, size)
);
export const useCursorSize = () => useAtom(updateCursorSize);

const resetEdit = atom<boolean>(false);
const updateResetEdit = atom(
  get => get(resetEdit),
  (_, set, param: boolean) => set(resetEdit, param)
);
export const useResetEdit = () => useAtom(updateResetEdit);

const undoEdit = atom<boolean>(false);
const updateUndoEdit = atom(
  get => get(undoEdit),
  (_, set, param: boolean) => set(undoEdit, param)
);
export const useUndoEdit = () => useAtom(updateUndoEdit);

const redoEdit = atom<boolean>(false);
const updateRedoEdit = atom(
  get => get(redoEdit),
  (_, set, param: boolean) => set(redoEdit, param)
);
export const useRedoEdit = () => useAtom(updateRedoEdit);

// const isKeyEvent = atom<boolean>(false);
// const updateIsKeyEvent = atom(
//   get => get(isKeyEvent),
//   (_, set, param: boolean) => set(isKeyEvent, param)
// );
// export const useIsKeyEvent = () => useAtom(updateIsKeyEvent);

const isEdited = atom<boolean>(false);
const updateIsEdited = atom(
  get => get(isEdited),
  (_, set, param: boolean) => set(isEdited, param)
);
export const useIsEdited = () => useAtom(updateIsEdited);

const zoomInHandler = atom<boolean>(false);
const updateZoomInHandler = atom(
  get => get(zoomInHandler),
  (_, set, param: boolean) => set(zoomInHandler, param)
);
export const useZoomInHandler = () => useAtom(updateZoomInHandler);

const zoomOutHandler = atom<boolean>(false);
const updateZoomOutHandler = atom(
  get => get(zoomOutHandler),
  (_, set, param: boolean) => set(zoomOutHandler, param)
);
export const useZoomOutHandler = () => useAtom(updateZoomOutHandler);

const zoomValue = atom<float>(1);
const updateZoomValue = atom(
  get => get(zoomValue),
  (_, set, param: float) => set(zoomValue, param)
);
export const useZoomValue = () => useAtom(updateZoomValue);

const isEditSave = atom<boolean>(false);
const updateIsEditSave = atom(
  get => get(isEditSave),
  (_, set, param: boolean) => set(isEditSave, param)
);
export const useIsEditSave = () => useAtom(updateIsEditSave);

const imageViewerParameter = atomWithReset("white");
const updateImageViewerParameter = atom(
  get => get(imageViewerParameter),
  (_, set, viewerParameter: string) => set(imageViewerParameter, viewerParameter)
);
export const useImageViewerParameter = () => useAtom(updateImageViewerParameter);
export const useResetImageViewerParameter = () => useResetAtom(imageViewerParameter);

const backgroundParameter = atomWithReset<string>("");
const updateBackgroundParameter = atom(
  get => get(backgroundParameter),
  (_, set, newParameter: string) => set(backgroundParameter, newParameter)
);

export const useBackgroundParameter = () => useAtom(updateBackgroundParameter);
export const useResetBackgroundParameter = () => useResetAtom(backgroundParameter);

import { AUTOMATION_STATUS, SMARTCROP_PREVIEW } from "../../common/Enums";
import { SelectedImage, OBJECT_TYPE, Photo, JSON_TYPE } from "../../common/Types";
import AutomationItem from "../../models/AutomationItem";
import AutomationJob from "../../models/AutomationJob";
import CroppedDataSummaryResponse from "../../models/CroppedDataSummaryResponse";
import { MarkerData } from "../../models/MarkerData";
import { PhotoType } from "../../ui-components/components/smart-crop-config/leftpanel/types";
import SmartCropAssets from "../../ui-components/components/smart-crop-config/modal/SmartCropAssets";

export const UPDATE_PREVIEW_STATUS = "UPDATE_PREVIEW_STATUS";
export const TOGGLE_SHOWMARKER_STATUS = "TOGGLE_SHOWMARKER_STATUS";
export const PAUSE_PROCESS = "PAUSE_PROCESS";
export const RESUME_PROCESS = "RESUME_PROCESS";
export const STOP_PROCESS = "STOP_PROCESS";
export const UPDATE_PROCESSED_COUNT = "UPDATE_PROCESSED_COUNT";
export const UPDATE_TOTAL_COUNT = "UPDATE_TOTAL_COUNT";
export const UPDATE_VIEW = "UPDATE_VIEW";
export const ADD_CROPPED_IMG = "ADD_CROPPED_IMG";
export const UPDATE_MARKER = "UPDATE_MARKER";
export const UPDATE_CROP_SIDE = "UPDATE_CROP_SIDE";
export const UPDATE_CROP_TYPE = "UPDATE_CROP_TYPE";
export const UPDATE_SELECTED_MARKER = "UPDATE_SELECTED_MARKER";
export const UPDATE_CROP_POSITION = "UPDATE_CROP_POSITION";
export const UPDATE_CROP_SIZE = "UPDATE_CROP_SIZE";
export const UPDATE_IS_INCLUDE_MARKERS_BOUNDARY = "UPDATE_IS_INCLUDE_MARKERS_BOUNDARY";
export const RESET_SMART_CROP_CONFIG = "RESET_SMART_CROP_CONFIG";
export const UPDATE_UPLOADED_MEDIA = "UPDATE_UPLOADED_MEDIA";
export const UPDATE_SMART_CROP_STATUS = "UPDATE_SMART_CROP_STATUS";
export const UPDATE_AUTOMATION_ID = "UPDATE_AUTOMATION_ID";
export const UPDATE_AUTOMATION_JOB = "UPDATE_AUTOMATION_JOB";
export const UPDATE_JOB_ID = "UPDATE_JOB_ID";
export const UPDATE_CROP_IMAGE = "UPDATE_CROP_IMAGE";
export const UPDATE_MARKER_OPTIONS = "UPDATE_MARKER_OPTIONS";
export const UPDATE_IMAGE_IDS = "UPDATE_IMAGE_IDS";
export const UPDATE_SAMPLE_ASSETS = "UPDATE_SAMPLE_ASSETS";
export const UPDATE_IMAGE_IS_LOADED = "UPDATE_IMAGE_IS_LOADED";
export const ADD_CROPPED_IMAGES = "ADD_CROPPED_IMAGES";
export const UPDATE_AUTOMATION_NAME = "UPDATE_AUTOMATION_NAME";
export const UPDATE_LARGE_PREVIEW = "UPDATE_LARGE_PREVIEW";
export const UPDATE_DOWNLOAD_ALL = "UPDATE_DOWNLOAD_ALL";
export const UPDATE_REMOVE_BACKGROUND = "UPDATE_REMOVE_BACKGROUND";
export const UPDATE_IS_UPLOADING = "UPDATE_IS_UPLOADING";

export const updateDownloadAll = (downloadAll: boolean) => ({
  type: UPDATE_DOWNLOAD_ALL,
  payload: downloadAll
});
export const updateLargePreview = (data: JSON_TYPE | undefined) => ({
  type: UPDATE_LARGE_PREVIEW,
  payload: data
});

export const updateAutomationName = (name: string) => ({
  type: UPDATE_AUTOMATION_NAME,
  payload: name
});

export const addCroppedImages = (images: Photo[]) => ({
  type: ADD_CROPPED_IMAGES,
  payload: images
});

export const updateIsImageLoaded = (isLoaded: boolean) => ({
  type: UPDATE_IMAGE_IS_LOADED,
  payload: isLoaded
});

export const updateAssets = (assets: SmartCropAssets) => ({
  type: UPDATE_SAMPLE_ASSETS,
  payload: assets
});

export const updateImageIds = (ids: string[]) => ({
  type: UPDATE_IMAGE_IDS,
  payload: ids
});

export const updateMarkerOptions = (options: OBJECT_TYPE[]) => ({
  type: UPDATE_MARKER_OPTIONS,
  payload: options
});

export const updateSelectedImage = (image: SelectedImage) => ({
  type: UPDATE_CROP_IMAGE,
  payload: image
});

export const updateJobId = (id: string) => ({
  type: UPDATE_JOB_ID,
  payload: id
});

export const updateAutomationJob = (job: AutomationJob) => ({
  type: UPDATE_AUTOMATION_JOB,
  payload: job
});

export const updateAutomationId = (id: number) => ({
  type: UPDATE_AUTOMATION_ID,
  payload: id
});

export const updateSmartCropStatus = (status: string) => ({
  type: UPDATE_SMART_CROP_STATUS,
  payload: status
});

export const updateUploadedMedia = (images: Photo[]) => ({
  type: UPDATE_UPLOADED_MEDIA,
  payload: images
});

export const resetSmartCropConfig = () => ({
  type: RESET_SMART_CROP_CONFIG
});

export const updateMarkersBoundary = (isIncludeMarkers: boolean) => ({
  type: UPDATE_IS_INCLUDE_MARKERS_BOUNDARY,
  payload: isIncludeMarkers
});

export const updateCropPosition = (position: OBJECT_TYPE) => ({
  type: UPDATE_CROP_POSITION,
  payload: position
});

export const updateCropSize = (size: OBJECT_TYPE) => ({
  type: UPDATE_CROP_SIZE,
  payload: size
});

export const updateMarker = (marker: string) => ({
  type: UPDATE_MARKER,
  payload: marker
});

export const updateCropSide = (cropSide: string) => ({
  type: UPDATE_CROP_SIDE,
  payload: cropSide
});

export const updateCropType = (cropType: string) => ({
  type: UPDATE_CROP_TYPE,
  payload: cropType
});

export const updateSelectedMarker = (marker: MarkerData) => ({
  type: UPDATE_SELECTED_MARKER,
  payload: marker
});

export const updatePreviewStatus = (status: SMARTCROP_PREVIEW) => ({
  type: UPDATE_PREVIEW_STATUS,
  payload: status
});

export const toggleShowmarkerStatus = () => ({
  type: TOGGLE_SHOWMARKER_STATUS
});

export const pauseAssetProcessing = () => ({
  type: PAUSE_PROCESS
});

export const resumeAssetProcessing = () => ({
  type: RESUME_PROCESS
});

export const stopAssetProcessing = () => ({
  type: STOP_PROCESS
});

export const updateProcessedAssetCount = (count: number) => ({
  type: UPDATE_PROCESSED_COUNT,
  payload: count
});

export const updateTotalAssetCount = (count: number) => ({
  type: UPDATE_TOTAL_COUNT,
  payload: count
});

export const updateView = (view: string) => ({
  type: UPDATE_VIEW,
  payload: view
});

export const updateRemoveBackground = (removeBackground: boolean) => ({
  type: UPDATE_REMOVE_BACKGROUND,
  payload: removeBackground
});

export const addCroppedImg = (img: Photo) => ({
  type: ADD_CROPPED_IMG,
  payload: img
});

export const updateIsUploading = (isUploading: boolean) => ({
  type: UPDATE_IS_UPLOADING,
  payload: isUploading
});

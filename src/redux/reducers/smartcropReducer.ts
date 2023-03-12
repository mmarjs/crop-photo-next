import { AnyAction } from "redux";
import AutomationJob from "../../models/AutomationJob";
import { MarkerData } from "../../models/MarkerData";
import SmartCropAssets from "../../ui-components/components/smart-crop-config/modal/SmartCropAssets";
import { UnitType } from "../../ui-components/enums";
import {
  ADD_CROPPED_IMG,
  PAUSE_PROCESS,
  RESET_SMART_CROP_CONFIG,
  RESUME_PROCESS,
  STOP_PROCESS,
  TOGGLE_SHOWMARKER_STATUS,
  UPDATE_CROP_SIDE,
  UPDATE_CROP_SIZE,
  UPDATE_CROP_TYPE,
  UPDATE_IS_INCLUDE_MARKERS_BOUNDARY,
  UPDATE_MARKER,
  UPDATE_PREVIEW_STATUS,
  UPDATE_PROCESSED_COUNT,
  UPDATE_SELECTED_MARKER,
  UPDATE_TOTAL_COUNT,
  UPDATE_UPLOADED_MEDIA,
  UPDATE_VIEW,
  UPDATE_SMART_CROP_STATUS,
  UPDATE_AUTOMATION_ID,
  UPDATE_AUTOMATION_JOB,
  UPDATE_JOB_ID,
  UPDATE_MARKER_OPTIONS,
  UPDATE_CROP_IMAGE,
  UPDATE_IMAGE_IDS,
  UPDATE_SAMPLE_ASSETS,
  UPDATE_IMAGE_IS_LOADED,
  ADD_CROPPED_IMAGES,
  UPDATE_AUTOMATION_NAME,
  UPDATE_LARGE_PREVIEW,
  UPDATE_DOWNLOAD_ALL,
  UPDATE_REMOVE_BACKGROUND,
  UPDATE_IS_UPLOADING
} from "../actions/smartcropActions";
import { SmartCropStruct, SmartCropStructType } from "../structs/smartcrop";

const smartcropReducer = (state = SmartCropStruct, action: AnyAction): SmartCropStructType => {
  switch (action.type) {
    case UPDATE_DOWNLOAD_ALL: {
      return {
        ...state,
        downloadAll: action.payload
      };
    }
    case UPDATE_LARGE_PREVIEW: {
      return {
        ...state,
        largePreview: action.payload
      };
    }
    case UPDATE_AUTOMATION_NAME: {
      return {
        ...state,
        automationName: action.payload
      };
    }
    case UPDATE_IMAGE_IS_LOADED: {
      return {
        ...state,
        isImageLoaded: action.payload
      };
    }
    case UPDATE_SAMPLE_ASSETS: {
      return {
        ...state,
        assets: action.payload
      };
    }
    case UPDATE_IMAGE_IDS: {
      return {
        ...state,
        imageIds: action.payload
      };
    }
    case UPDATE_CROP_IMAGE: {
      return {
        ...state,
        selectedImage: action.payload
      };
    }
    case UPDATE_MARKER_OPTIONS: {
      return {
        ...state,
        markerOptions: action.payload
      };
    }
    case UPDATE_JOB_ID: {
      return {
        ...state,
        latestJobId: action.payload
      };
    }
    case UPDATE_AUTOMATION_JOB: {
      return {
        ...state,
        automationJob: action.payload
      };
    }
    case UPDATE_AUTOMATION_ID: {
      return {
        ...state,
        automationId: action.payload
      };
    }
    case UPDATE_SMART_CROP_STATUS: {
      return {
        ...state,
        smartCropStatus: action.payload
      };
    }
    case UPDATE_UPLOADED_MEDIA:
      return {
        ...state,
        uploadedMedia: action.payload
      };
    case UPDATE_IS_INCLUDE_MARKERS_BOUNDARY:
      return {
        ...state,
        isIncludeMarkersBoundary: action.payload
      };
    case UPDATE_MARKER:
      return {
        ...state,
        currentMarker: action.payload
      };
    case UPDATE_SELECTED_MARKER:
      return {
        ...state,
        selectedMarker: action.payload
      };
    case UPDATE_CROP_SIDE:
      return {
        ...state,
        cropSide: action.payload
      };
    case UPDATE_CROP_SIZE:
      return {
        ...state,
        cropSize: action.payload
      };
    case UPDATE_CROP_TYPE:
      return {
        ...state,
        cropType: action.payload
      };
    case UPDATE_PREVIEW_STATUS:
      return {
        ...state,
        preview: action.payload
      };
    case TOGGLE_SHOWMARKER_STATUS:
      return {
        ...state,
        showMarker: !state.showMarker
      };
    case PAUSE_PROCESS:
      return {
        ...state,
        pause: true
      };
    case RESUME_PROCESS:
      return {
        ...state,
        pause: false
      };
    case STOP_PROCESS:
      return {
        ...state,
        stop: true
      };
    case UPDATE_PROCESSED_COUNT:
      return {
        ...state,
        processed: action.payload
      };
    case UPDATE_TOTAL_COUNT:
      return {
        ...state,
        total: action.payload
      };
    case UPDATE_VIEW:
      return {
        ...state,
        currentView: action.payload
      };
    case ADD_CROPPED_IMG:
      return {
        ...state,
        processed: state.processed + 1,
        croppedImgs: [...state.croppedImgs, action.payload],
        completedDate: state.processed === state.total - 1 ? new Date() : state.completedDate
      };

    case ADD_CROPPED_IMAGES: {
      return {
        ...state,
        resultsImages: action.payload
      };
    }

    case UPDATE_REMOVE_BACKGROUND: {
      return {
        ...state,
        removeBackground: action.payload
      };
    }
    case RESET_SMART_CROP_CONFIG:
      return {
        ...state,
        currentMarker: "",
        selectedMarker: new MarkerData(0, 0, 0, 0, UnitType.PERCENTAGE),
        cropSide: "TOP",
        cropType: "",
        cropPosition: { x: 50, y: 50 },
        cropSize: {
          top: 100,
          bottom: 100,
          left: 100,
          right: 100
        },
        isIncludeMarkersBoundary: false,
        // smartCropStatus: undefined,
        automationJob: new AutomationJob(),
        latestJobId: "",
        pause: false,
        stop: false,
        processed: 0,
        total: 0,
        markerOptions: [],
        assets: new SmartCropAssets([]),
        selectedImage: {
          id: "",
          url: ""
        },
        isImageLoaded: false,
        croppedImgs: [],
        resultsImages: [],
        automationName: "",
        downloadAll: false
      };
    case UPDATE_IS_UPLOADING:
      return {
        ...state,
        isUploading: action.payload
      };
    default:
      return { ...state };
  }
};

export default smartcropReducer;

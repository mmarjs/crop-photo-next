export enum SMARTCROP_PREVIEW {
  MODIFIED = "modified",
  ORIGINAL = "original"
}

export enum SMART_CROP {
  TYPE = "SMART_CROP"
}

export enum UPLOAD_STATUS {
  NOT_STARTED = "NO",
  RUNNING = "RUNNING",
  FINISHED = "FINISHED",
  CANCELLED = "CANCELLED",
  S3UPLOADED = "S3UPLOADED"
}

export enum NAVIGATION_MENU {
  HOME = "Home",
  SETTINGS = "Settings",
  BILLINGS = "Billings"
}

export enum AUTOMATION_STATUS {
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  CONFIGURED = "CONFIGURED",
  NOT_CONFIGURED = "NOT_CONFIGURED"
}

export enum Direction {
  HORIZONTAL = "horizontal",
  VERTICAL = "vertical"
}

export enum JOB_ACTIONS {
  PAUSE = "PAUSE",
  STOP = "STOP",
  RESUME = "RESUME"
}

export enum JOB_STATUS {
  NOT_STARTED = "NOT_STARTED",
  COMPLETED = "COMPLETED",
  RUNNING = "RUNNING",
  SUCCEEDED = "SUCCEEDED",
  STARTING = "STARTING",
  FAILED = "FAILED"
}

export enum REQUEST_STATUS {
  IDLE = "idle",
  LOADING = "loading",
  SUCCESS = "succeeded",
  FAILED = "failed"
}

export enum PROMO_CODE_DURATION {
  ONCE = "ONCE",
  FOREVER = "FOREVER",
  REPEATING = "REPEATING"
}

export enum ARTICLE_URL_ID {
  UNRECOGNIZABLE_FACE_CROP = 6720728,
  REMOVE_BG_RESIZE = 6721220,
  CUSTOM_SMART_CROP = 6721250,
  LISTING_ANALYZER = 6721259,
  START_AUTOMATION = 6728759,
  PROJECT = 6728960,
  SAMPLE_IMAGE = 6728986,
  CROP_MARKER = 6079897,
  CROP_MARKER_URL = "https://help.crop.photo/en/articles/6079897-a-step-by-step-guide-to-crop-photo#h_04b21c5cf5",
  CROP_MARKER_ADV_SETTINGS = 6119421,
  PROJECT_NAME = "https://help.crop.photo/en/articles/6729043-rename-project",
  REMOVE_BACKGROUND = 6919616,
  BACK_ANGLE_FACE_DETECTION = 6779221,
  REMOVE_BACKGROUND_URL = "https://help.crop.photo/en/articles/6919616-remove-background-setting",
  BACKGROUND = 6919657,
  BACKGROUND_URL = "https://help.crop.photo/en/articles/6919657-background-color-setting",
  SIZE_OUTPUT = 6949249,
  SIZE_OUTPUT_URL = "https://help.crop.photo/en/articles/6949249-size-output",
  CUSTOM_SIZE_MODAL = 6949302,
  CUSTOM_SIZE_MODAL_URL = "https://help.crop.photo/en/articles/6949302-add-custom-size",
  ADD_CREDITS_MODAL_URL = "https://help.crop.photo/en/articles/6949324-add-credits"
}

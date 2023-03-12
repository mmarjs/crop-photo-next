/*----------------------- Global Constants ---------------------*/
export const KeyCode = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,

  SPACEBAR: 32,
  ENTER: 13,
  DELETE: 8,
  SHIFT: 16,
  CONTROL: 17,
  ALT: 18,
  META: 224,
  ESCAPE: 27,

  A: 65,
  B: 66,
  C: 67,
  D: 68,
  E: 69,
  F: 70,
  G: 71,
  H: 72,
  I: 73,
  J: 74,
  K: 75,
  L: 76,
  M: 77,
  N: 78,
  O: 79,
  P: 80,
  Q: 81,
  R: 82,
  S: 83,
  T: 84,
  U: 85,
  V: 86,
  W: 87,
  X: 88,
  Y: 89,
  Z: 90
};

/**
 *
 */
export const NULL_VALUE = null;

/**
 * comma operator
 */
export const COMMA_DELIMITER: string = ",";

/**
 * hiphen operator
 */
export const HIPHEN_DELIMITER: string = "-";

/**
 * underscore operator
 */
export const UNDERSCORE_DELIMITER: string = "_";

/**
 * forward slash operator
 */
export const FORWARD_SLASH: string = "/";

/**
 * backward slash operator
 */
export const BACKWARD_SLASH: string = "\\";

/**
 * separator in any file path
 */
export const FILE_PATH_SEPARATOR: string = FORWARD_SLASH;

/**
 * separator in a file name.
 */
export const FILE_NAME_DELIMITER: string = ".";

/**
 * contains default user name.
 */
export const DEFAULT_FULL_USERNAME: string = "Anonymous";

/**
 * ascending order value
 */
export const ASCENDING_SORT_ORDER: string = "ASC";

/**
 * descending order value
 */
export const DESCENDING_SORT_ORDER: string = "DESC";

/**
 * default sort order
 */
export const DEFAULT_SORT_ORDER: string = ASCENDING_SORT_ORDER;

/**
 * default array join delimiter
 */
export const DEFAULT_ARRAY_JOIN_DELIMITER: string = COMMA_DELIMITER;

/**
 * default value for page size
 */
export const DEFAULT_PAGE_SIZE: number = process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE
  ? parseInt(process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE)
  : 100;
/**
 * Allowed extensions for upload
 */
export const ACCEPTED_EXTENSIONS_FOR_UPLOAD = ["jpg", "jpeg", "png", "gif", "webp"];
/**
 * Allowed file sizein KB for upload
 */
export const ACCEPTED_FILE_SIZE = 25 * 1024 * 1024;
/**
 * Max concurrent count
 */
export const MAX_CONCURRENT_COUNT = 2;
/**
 * Max retry count for Thumb generation check
 */
export const MAX_RETRY_FOR_THUMB_CHECK = 200;
/**
 * Interval for Thumb generation check in millisecond
 */
export const INTERVAL_FOR_THUMB_CHECK = 3000;

export const DEFAULT_CURRENCY = "$";

//This data is for testing purposes only when need to test the labels on the plans page in different scenarios.
//Change the data.data with this data in const planDetails = new PlanDetailsResponse(data.data) in line 95 of Select Plans component.
//TODO: delete when cancel current plan is available from BE
export const mockPlans = {
  list_plan_details: [
    {
      plan_name: "Free",
      plan_rate: "0",
      plan_description:
        "Upto 20 Free Crops, Unlimited automations, Unlimited downloads, Full access to Smart Crop, 7 days of free storage",
      plan_duration: "week",
      plan_level: 0,
      price_id: "price_1L3hhsGLOO5b7AOM86KvIgrD",
      price_metadata: { RETOUCH: "1.75", credits: "20", smart_crop: "0.5" }
    },
    {
      plan_name: "Enterprise",
      plan_rate: "14400",
      plan_description:
        "Up to 10,000 crops per month, $0.15 per crop after limit, Unlimited automations, Unlimited downloads, Fulls access to Smart Crop, 6 months free storage",
      plan_duration: "year",
      plan_level: 3,
      price_id: "price_1LN0Y7GLOO5b7AOMCPncJxyw"
    },
    {
      plan_name: "Enterprise",
      plan_rate: "1500",
      plan_description:
        "Up to 10,000 crops per month, $0.15 per crop after limit, Unlimited automations, Unlimited downloads, Fulls access to Smart Crop, 6 months free storage",
      plan_duration: "month",
      plan_level: 3,
      price_id: "price_1LN0UFGLOO5b7AOMkXKieo0V",
      status: { start_date: "25/08/2022" },
      next_charge_date: "25/08/2022"
    },
    {
      plan_name: "Studio",
      plan_rate: "1200",
      plan_description:
        "Up to 1000 crops per month, $0.20 per crop after limit, Unlimited automations, Unlimited downloads, Fulls access to Smart Crop, 6 months free storage",
      plan_duration: "year",
      plan_level: 2,
      price_id: "price_1L2Y9XGLOO5b7AOM8neuSHOY",
      price_metadata: { credits: "2400", smart_crop: "0.5" }
    },
    {
      plan_name: "Studio",
      plan_rate: "200",
      plan_description:
        "Up to 1000 crops per month, $0.20 per crop after limit, Unlimited automations, Unlimited downloads, Fulls access to Smart Crop, 6 months free storage",
      plan_duration: "month",
      plan_level: 2,
      price_id: "price_1KsKMAGLOO5b7AOMcU0Zv1sU",
      price_metadata: { credits: "400", smart_crop: "0.5" },
      status: { end_date: "25/08/2022" },
      scheduled_plan_name: "Enterprise"
    },
    {
      plan_name: "Essential",
      plan_rate: "250",
      plan_description:
        "Up to 100 crops per month, $0.25 per crop after limit, Unlimited automations, Unlimited downloads, Fulls access to Smart Crop, 6 months free storage",
      plan_duration: "year",
      plan_level: 1,
      price_id: "price_1L2YQUGLOO5b7AOMznva4NUb",
      price_metadata: { credits: "1200", smart_crop: "0.5" }
    },
    {
      plan_name: "Essential",
      plan_rate: "25",
      plan_description:
        "Up to 100 crops per month, $0.25 per crop after limit, Unlimited automations, Unlimited downloads, Fulls access to Smart Crop, 6 months free storage",
      plan_duration: "month",
      plan_level: 1,
      price_id: "price_1KsKKeGLOO5b7AOMAzrUKiQU",
      price_metadata: { credits: "50", smart_crop: "0.5" }
    }
  ],
  price_id_response: { price_id: "price_1KsKKeGLOO5b7AOMAzrUKiQU", is_expired: true }
};

export enum CROP_IMAGE_VIEWER {
  TOP_OFFSET = 7.5,
  LEFT_OFFSET = 7.5
}

export enum Exceptions {
  INSUFFICIENT_CREDITS = "/exception/client_error/insufficient_credits",
  AUTOMATION_DELETE_NOT_ALLOWED = "/exception/client_error/automation_delete_not_allowed",
  AUTOMATION_NOT_FOUND = "/exception/client_error/automation_not_found",
  INVALID_PROMO_CODE = "/exception/client_error/invalid_promo_code",
  AUTOMATION_START_NOT_ALLOWED = "/exception/client_error/automation_start_not_allowed",
  PROMO_CODE_INVALID_FOR_CUSTOMER = "/exception/client_error/coupon_not_valid_for_customer",
  COUPON_NOT_VALID_FOR_ADDING_CREDITS = "/exception/client_error/coupon_not_valid_for_adding_credits",
  COUPON_ONLY_VALID_FOR_APPLICABLE_PRODUCTS = "/exception/client_error/coupon_only_valid_for_applicable_products"
}

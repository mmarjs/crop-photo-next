import { Exceptions } from "../../ui-components/enums/Exceptions";
import { toast } from "../../ui-components/components/toast";
import ProblemJson from "../web/problem-json";
import { t } from "i18next";
import { ProblemJsonException } from "./problem-json-exception";

export const ProblemJSONErrorCodeToMessageMapping = (errorCode: string) => {
  switch (errorCode) {
    case Exceptions.INSUFFICIENT_CREDITS:
      return "errors.insufficient_credits";

    case Exceptions.AUTOMATION_DELETE_NOT_ALLOWED:
      return "errors.automation_delete";

    case Exceptions.AUTOMATION_NOT_FOUND:
      return "errors.automation_not_exist";

    case Exceptions.INVALID_PROMO_CODE:
      return "errors.invalid_promo_code";

    case Exceptions.AUTOMATION_START_NOT_ALLOWED:
      return "errors.automation_start_not_allowed";

    case Exceptions.PROMO_CODE_INVALID_FOR_CUSTOMER:
      return "errors.coupon_not_valid_for_customer";

    case Exceptions.COUPON_NOT_VALID_FOR_ADDING_CREDITS:
      return "errors.coupon_not_valid_for_adding_credits";

    case Exceptions.COUPON_ONLY_VALID_FOR_APPLICABLE_PRODUCTS:
      return "errors.coupon_only_valid_for_applicable_products";
  }
};

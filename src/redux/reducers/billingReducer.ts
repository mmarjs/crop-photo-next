import { AnyAction } from "redux";
import {
  UPDATE_CS_VALUE,
  UPDATE_ELEMENTS_VALUE,
  UPDATE_PROMO_CODE_VALUE,
  UPDATE_STRIPE_VALUE,
  UPDATE_SUBSCRIPTION_ID_VALUE,
  UPDATE_PAYMENT_REQUIRED
} from "../actions/billingActions";
import { BillingStruct, BillingStructType } from "../structs/billing";

const billingReducer = (state = BillingStruct, action: AnyAction): BillingStructType => {
  switch (action.type) {
    case UPDATE_STRIPE_VALUE:
      return {
        ...state,
        stripe: action.payload
      };

    case UPDATE_ELEMENTS_VALUE:
      return {
        ...state,
        elements: action.payload
      };

    case UPDATE_CS_VALUE:
      return {
        ...state,
        cs: action.payload
      };

    case UPDATE_SUBSCRIPTION_ID_VALUE:
      return {
        ...state,
        subscriptionId: action.payload
      };

    case UPDATE_PAYMENT_REQUIRED:
      return {
        ...state,
        paymentRequired: action.payload
      };

    case UPDATE_PROMO_CODE_VALUE:
      return {
        ...state,
        promoCode: action.payload
      };

    default:
      return { ...state };
  }
};

export default billingReducer;

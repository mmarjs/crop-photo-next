export const UPDATE_STRIPE_VALUE = "UPDATE_STRIPE_VALUE";
export const UPDATE_ELEMENTS_VALUE = "UPDATE_ELEMENTS_VALUE";
export const UPDATE_CS_VALUE = "UPDATE_CS_VALUE";
export const UPDATE_SUBSCRIPTION_ID_VALUE = "UPDATE_SUBSCRIPTION_ID_VALUE";
export const UPDATE_PROMO_CODE_VALUE = "UPDATE_PROMO_CODE_VALUE";
export const UPDATE_PAYMENT_REQUIRED = "UPDATE_PAYMENT_REQUIRED";

export const updateStripeValue = (stripe: any) => ({
  type: UPDATE_STRIPE_VALUE,
  payload: stripe
});

export const updateElementsValue = (elements: any) => ({
  type: UPDATE_ELEMENTS_VALUE,
  payload: elements
});

export const updateCSValue = (cs: string) => ({
  type: UPDATE_CS_VALUE,
  payload: cs
});

export const updateSubscriptionIdValue = (subscriptionId: string) => ({
  type: UPDATE_SUBSCRIPTION_ID_VALUE,
  payload: subscriptionId
});

export const updatePaymentRequired = (paymentRequired: boolean) => ({
  type: UPDATE_PAYMENT_REQUIRED,
  payload: paymentRequired
});

export const updatePromoCodeValue = (promoCode: string) => ({
  type: UPDATE_PROMO_CODE_VALUE,
  payload: promoCode
});

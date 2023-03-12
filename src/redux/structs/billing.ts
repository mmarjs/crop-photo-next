export type BillingStructType = {
  stripe: any;
  elements: any;
  cs: string;
  promoCode: string;
  subscriptionId: string;
  paymentRequired: boolean;
};

export const BillingStruct: BillingStructType = {
  stripe: null,
  elements: null,
  cs: "",
  promoCode: "",
  subscriptionId: "",
  paymentRequired: true
};

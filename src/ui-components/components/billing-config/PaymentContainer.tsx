//@ts-nocheck

import React, { useState, useEffect } from "react";
import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { BillingStructType } from "../../../redux/structs/billing";
import {
  updateStripeValue,
  updateElementsValue,
  updateSubscriptionIdValue,
  updateCSValue
} from "../../../redux/actions/billingActions";
import { connect, ConnectedProps } from "react-redux";
import { UserCardData } from "../../../common/Classes";
import { element } from "prop-types";
import { StringUtil } from "../../utils";

type PropsFromRedux = ConnectedProps<typeof connector>;

interface PaymentContainerProps extends PropsFromRedux {
  clientSecret: string;
  isAddNewCard: boolean;
  setStripeElementLoaded?: Dispatch<SetStateAction<boolean>>;
}

const PaymentContainer = ({
  isAddNewCard,
  clientSecret = "",
  subscriptionId = "",
  updateStripeValue,
  updateElementsValue,
  updateCSValue,
  setStripeElementLoaded,
  stripe,
  elements
}) => {
  const stripeValue = useStripe();
  const elementsValue = useElements();
  const [errorMessage, setErrorMessage] = useState(null);
  useEffect(() => {
    console.log("stripe value in payment container", stripeValue);
    updateCSValue(clientSecret);
    updateStripeValue(stripeValue);
    updateElementsValue(elementsValue);
    updateSubscriptionIdValue(subscriptionId);
  }, [stripeValue, elementsValue]);

  useEffect(() => {
    console.log(
      `inside useEffect when stripe and elements value are setting as stripe ${stripe} and elements as ${elements}`
    );
    if (stripe && elements) {
      console.log("inside useEffect when stripe and elements value are set");
      if (setStripeElementLoaded) setStripeElementLoaded(true);
    }
  }, [stripe, elements]);

  return <>{isAddNewCard ? <PaymentElement /> : null}</>;
};

const mapStateToProps = (state: { billing: BillingStructType }) => ({
  stripe: state.billing.stripe,
  elements: state.billing.elements,
  cs: state.billing.cs,
  subscriptionId: state.billing.subscriptionId
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  updateStripeValue: (stripe: any) => dispatch(updateStripeValue(stripe)),
  updateElementsValue: (elements: any) => dispatch(updateElementsValue(elements)),
  updateCSValue: (cs: string) => dispatch(updateCSValue(cs)),
  updateSubscriptionIdValue: (subscriptionId: string) => dispatch(updateSubscriptionIdValue(subscriptionId))
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(PaymentContainer);

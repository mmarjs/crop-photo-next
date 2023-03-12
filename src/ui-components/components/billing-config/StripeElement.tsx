//@ts-nocheck

import { CardElement, Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Skeleton } from "antd";
import PaymentContainer from "./PaymentContainer";
import API from "../../../util/web/api";
import { StringUtil } from "../../utils";
import { UserCardData } from "../../../common/Classes";
import { Logger } from "aws-amplify";
import { toast } from "../toast";
import { getStripePublishableKey } from "../../../../datadogInitialize";
import { BillingStructType } from "../../../redux/structs/billing";
// import {Dispatch} from "redux";
import { connect } from "react-redux";
import { mapErrorFromProblemJson, ProblemJsonException } from "../../../util/exception/problem-json-exception";
import { useTranslation } from "react-i18next";
import { updatePaymentRequired } from "../../../redux/actions/billingActions";

interface StripeElementProps {
  priceId?: string;
  amount?: number;
  userCardData?: UserCardData;
  setPaymentCallRequired?: Dispatch<SetStateAction<boolean>>;
  callType: string;
  setStripeElementLoaded?: Dispatch<SetStateAction<boolean>>;
  isPaymentRequiredForUpgrade?: boolean;
}
const StripeElement = ({
  priceId,
  amount,
  userCardData = new UserCardData(),
  setPaymentCallRequired,
  callType,
  setStripeElementLoaded,
  isPaymentRequiredForUpgrade,
  promoCode,
  updatePaymentRequired,
  cs
}: StripeElementProps) => {
  const logger = new Logger("ui-components.componenets.billing-config.stripeElements");

  const publicKey = getStripePublishableKey();
  const stripePromise = loadStripe(publicKey);
  const [options, setOptions] = useState({});
  const [subscriptionId, setSubscriptionId] = useState("");
  const [paymentRequired, setPaymentRequired] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const { t } = useTranslation();

  const createCSForSubscription = async () => {
    setLoaded(false);
    if (userCardData.isEmpty()) {
      if (isPaymentRequiredForUpgrade) {
        try {
          let res = await API.getSubscriptionApiCS(priceId, promoCode);
          res.onResponse(data => {
            if (data.data.is_success) {
              let clientSecret = data.data.client_secret;
              console.log("Client secret 1 :", clientSecret);
              setOptions({ clientSecret: clientSecret });
            }
            setLoaded(true);
          });
        } catch (e) {
          console.log("Erroe:::::", e);
        }
      } else {
        API.createSetupIntent().then(data => {
          if (data.data.is_success) {
            let clientSecret = data.data.client_secret;
            logger.debug("client secret for add card", clientSecret);
            setOptions({ clientSecret: clientSecret });
            if (setPaymentCallRequired) setPaymentCallRequired(data.data.bank_authentication_required);
          }
          setLoaded(true);
        });
      }
    } else {
      if (isPaymentRequiredForUpgrade) {
        if (StringUtil.isNotEmpty(promoCode)) {
          console.log("sub id here is: ", subscriptionId);
          try {
            let res = await API.addPromoCodeToSubscription(subscriptionId, promoCode, priceId);
            res.onResponse(data => {
              if (data.data.is_success) {
                let clientSecret = data.data.client_secret;
                let paymentRe = data?.data?.payment_required;
                setOptions({ clientSecret: clientSecret });
                //TODO: handle no value found case
                updatePaymentRequired(paymentRe);
                // When paymentRequired = false. This is the case of when promo code is of type 100%off and the final amount is 0$. So no payment required for that.
                // Directly close the modal and refresh page. // Subscription starts on click of add button
              }
              setLoaded(true);
            });
          } catch (e) {
            console.log("Erroe:::::", e);
            //Todo: Put loggers here
          }
        } else {
          try {
            let res = await API.createSubscriptionWithoutAddingPMApiCS(priceId, promoCode);
            res.onResponse(data => {
              if (data.data.is_success) {
                let clientSecret = data.data.client_secret;
                let subscriptionId = data.data.subscription_id;
                setOptions({ clientSecret: clientSecret });
                setSubscriptionId(subscriptionId);
              }
              setLoaded(true);
            });
          } catch (e) {
            //Todo: Put loggers here
            console.log("Erroe:::::", e);
          }
        }
      } else {
        setLoaded(true);
      }
    }
  };

  const createCSForChargingOverage = () => {
    //TodO: In case of when card is not present handle that/dont allow
    console.log("overage charged api call");
    try {
      logger.debug("calling charge-customer api for overage charge");
      API.chargeForOverage()
        .then(data => {
          toast(t("billing.overage_payment.payment_request_submitted"));
          logger.debug("charge customer Api is with response", data.data);
          if (data.data.is_success) {
            let clientSecret = data.data.client_secret;
            logger.debug("client secret for overage charge", clientSecret);
            setOptions({ clientSecret: clientSecret });
            // if (setPaymentCallRequired) setPaymentCallRequired(data.data.bank_authentication_required);
          } else {
            logger.debug("charge customer api for overage charge with failure code: ", data?.data?.failure_code);
            if (data?.data?.failure_code === "card_declined" || data?.data?.failure_code === "validation_error") {
              toast(data?.data?.failure_reason, "error");
            } else {
              toast("An unexpected error occurred.", "error");
            }
          }
          if (setPaymentCallRequired) setPaymentCallRequired(data?.data?.bank_authentication_required);
          setLoaded(true);
        })
        .catch((error: Error) => {
          if (error instanceof ProblemJsonException) {
            toast(mapErrorFromProblemJson(error), "error");
          } else {
            toast(error.message, "error");
          }
        });
    } catch (e) {
      logger.error("charge-customer api for overage charge catch block: ", e);
    }
  };

  const createCSForAddCredit = () => {
    if (userCardData.isEmpty()) {
      try {
        API.getPaymentIntentCS(amount, promoCode).then(data => {
          if (data.data.is_success) {
            let clientSecret = data.data.client_secret;
            console.log("client secret for add credit", clientSecret);
            setOptions({ clientSecret: clientSecret });
          }
          setLoaded(true);
        });
      } catch (e) {
        console.log("Erroe:::::", e);
      }
    } else {
      try {
        logger.debug("calling charge-customer api");
        API.chargeCustomer(amount, promoCode).then(
          data => {
            logger.debug("charge customer Api is with response", data.data);
            if (data.data.is_success) {
              let clientSecret = data.data.client_secret;
              logger.debug("client secret for add credit", clientSecret);
              setOptions({ clientSecret: clientSecret });
              // if (setPaymentCallRequired) setPaymentCallRequired(data.data.bank_authentication_required);
            } else {
              logger.debug("charge customer api with failure code: ", data?.data?.failure_code);
              if (data?.data?.failure_code === "card_declined" || data?.data?.failure_code === "validation_error") {
                toast(data?.data?.failure_reason, "error");
              } else {
                toast("An unexpected error occurred.", "error");
              }
            }
            if (setPaymentCallRequired) setPaymentCallRequired(data?.data?.bank_authentication_required);
            setLoaded(true);
          },
          error => {
            logger.error("charge-customer api is failed with error: ", error);
          }
        );
      } catch (e) {
        logger.error("charge-customer api catch block: ", e);
      }
    }
  };

  const createCSForAddCard = () => {
    API.createSetupIntent().then(data => {
      if (data.data.is_success) {
        let clientSecret = data.data.client_secret;
        console.log("client secret for add card", clientSecret);
        setOptions({ clientSecret: clientSecret });
        if (setPaymentCallRequired) setPaymentCallRequired(data.data.bank_authentication_required);
      }
      setLoaded(true);
    });
  };

  useEffect(() => {
    setLoaded(false);
    console.log(
      `call type in stripe element page ${callType}  user card data in stripe element page ${userCardData}  price id in Stripe element ${priceId}  
      amount in stripe element ${amount} and Promo code is ${promoCode}`
    );
    if (callType === "SUBSCRIPTION") {
      createCSForSubscription();
    } else if (callType === "ADD_CREDITS") {
      createCSForAddCredit();
    } else if (callType === "OVERAGE") {
      createCSForChargingOverage();
    } else if (callType === "ADD_CARD") {
      createCSForAddCard();
    } else {
      setLoaded(true);
    }
  }, [amount, promoCode]);

  return (
    <div style={{ minHeight: userCardData.isEmpty() ? "18rem" : "auto", marginTop: "1rem" }}>
      {loaded ? (
        <Elements stripe={stripePromise} options={options}>
          <PaymentContainer
            clientSecret={options.clientSecret}
            subscriptionId={subscriptionId}
            isAddNewCard={userCardData.isEmpty()}
            setStripeElementLoaded={setStripeElementLoaded}
          />
        </Elements>
      ) : userCardData.isEmpty() ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : null}
    </div>
  );
};

const mapStateToProps = (state: { billing: BillingStructType }) => ({
  stripe: state.billing.stripe,
  elements: state.billing.elements,
  cs: state.billing.cs,
  promoCode: state.billing.promoCode
});
const mapDispatchToProps = (dispatch: Dispatch) => ({
  updatePaymentRequired: (paymentRequired: boolean) => dispatch(updatePaymentRequired(paymentRequired))
});
const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(StripeElement);
// export default StripeElement;

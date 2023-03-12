import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import styles from "../../../styles/AddNewCard.module.css";
import StripeElement from "./StripeElement";
import { PromoCodeResponse, UserCardData } from "../../../common/Classes";
import { useTranslation } from "react-i18next";
import { Logger } from "aws-amplify";
import { capitalize } from "lodash";
import { InputWithLabel } from "../composite/input-with-label";
import { Button } from "../button";
import { PlanDetails } from "../plan-config/PlanDetails";
import API from "../../../util/web/api";
import { toast } from "../toast";

import { ProblemJSONErrorCodeToMessageMapping } from "../../../util/exception/ProblemJsonErrorCodeToMesaageMapping";
import { updatePromoCodeValue } from "../../../redux/actions/billingActions";
import { connect, useDispatch, useSelector } from "react-redux";
import billingReducer from "../../../redux/reducers/billingReducer";
import { BillingStructType } from "../../../redux/structs/billing";
import PromoCodeModal from "./PromoCodeModal";

export type UpgradePlanModalProps = {
  promoCode: string;
  selectedPlan: PlanDetails;
  userCardData?: UserCardData;
  paymentRequired?: boolean;
  priceId?: string;
  customAmount?: boolean;
  setPaymentCallRequired?: Dispatch<SetStateAction<boolean>>;
  callType: string;
  isPaymentRequiredForUpgrade: boolean;
  setStripeElementLoaded: Dispatch<SetStateAction<boolean>>;
};

export default function UpgradePlanModal({
  promoCode = "",
  selectedPlan,
  userCardData = new UserCardData(),
  priceId = "",
  setPaymentCallRequired,
  callType,
  isPaymentRequiredForUpgrade,
  setStripeElementLoaded
}: UpgradePlanModalProps) {
  const { t } = useTranslation();
  const logger = new Logger("components.billing-config.UpgradePlanModal");

  useEffect(() => {}, []);

  const payableAmount = () => {
    return (
      <>
        <div className={styles.amount}>Amount</div>
        <div className={styles.amountInputField}>{selectedPlan.planRate ? <p>$ {selectedPlan.planRate}</p> : null}</div>
        <PromoCodeModal amount={selectedPlan.planRate} plan={selectedPlan} />
      </>
    );
  };

  return (
    <>
      <StripeElement
        priceId={priceId}
        amount={selectedPlan.planRate}
        userCardData={userCardData}
        setPaymentCallRequired={setPaymentCallRequired}
        callType={callType}
        setStripeElementLoaded={setStripeElementLoaded}
        isPaymentRequiredForUpgrade={isPaymentRequiredForUpgrade}
      />
      {userCardData.isEmpty() ? null : (
        <>
          <img
            src={
              userCardData.getCardType() == "mastercard"
                ? "/images/mastercard-icon.svg"
                : userCardData.getCardType() == "visa"
                ? "/images/visa-icon.svg"
                : ""
            }
            className={styles.cardType}
          />
          <div style={{ display: "inline-block" }}>
            <p className={styles.cardDetail}>
              {/* {userCardData.getCardType()} ending in {userCardData.getCardNumber()} */}
              {t("billing.card_desc", {
                card_type: capitalize(userCardData.getCardType()),
                card_number: userCardData.getCardNumber()
              })}
            </p>
            <p className={styles.cardExpiryDate}>Expires on {userCardData.getCardExpireDate()}</p>
          </div>
        </>
      )}

      {payableAmount()}
    </>
  );
}

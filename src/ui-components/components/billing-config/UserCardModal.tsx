import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import styles from "../../../styles/AddNewCard.module.css";
import StripeElement from "./StripeElement";
import { UserCardData } from "../../../common/Classes";
import { StringUtil } from "../../utils";
import { capitalize } from "lodash";
import { useTranslation } from "react-i18next";
import PromoCodeModal from "./PromoCodeModal";

export type UserCardModalProps = {
  planRate?: number;
  userCardData?: UserCardData;
  isPaymentAmountDisplay?: boolean;
  priceId?: string;
  setPaymentCallRequired?: Dispatch<SetStateAction<boolean>>;
  callType: string;
  stripeElementLoaded: boolean;
  setStripeElementLoaded: Dispatch<SetStateAction<boolean>>;
  amountSubmitted: boolean;
};

export default function UserCardModal({
  planRate,
  userCardData = new UserCardData(),
  isPaymentAmountDisplay = false,
  priceId = "",
  setPaymentCallRequired,
  stripeElementLoaded,
  setStripeElementLoaded,
  callType,
  amountSubmitted
}: UserCardModalProps) {
  const [isStripeLoadingNeeded, setStripeLoadingNeeded] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (((planRate && planRate > 0) || StringUtil.isNotEmpty(priceId)) && (amountSubmitted || userCardData.isEmpty())) {
      setStripeLoadingNeeded(true);
    }
    if (callType === "OVERAGE" && planRate && planRate > 0) {
      setStripeLoadingNeeded(true);
    }
  }, [amountSubmitted, planRate]);

  const payableAmount = () => {
    return (
      <>
        <div className={styles.amount}>Amount</div>
        <div className={styles.amountInputField}>{planRate ? <p>$ {planRate}</p> : null}</div>

        <PromoCodeModal amount={planRate} />
      </>
    );
  };

  return (
    <>
      {isStripeLoadingNeeded ? (
        <StripeElement
          priceId={priceId}
          amount={planRate}
          userCardData={userCardData}
          setPaymentCallRequired={setPaymentCallRequired}
          callType={callType}
          setStripeElementLoaded={setStripeElementLoaded}
        />
      ) : null}
      {!userCardData.isEmpty() ? (
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
              {t("billing.card_desc", {
                card_type: capitalize(userCardData.getCardType()),
                card_number: userCardData.getCardNumber()
              })}
            </p>
            <p className={styles.cardExpiryDate}>Expires on {userCardData.getCardExpireDate()}</p>
          </div>
        </>
      ) : null}

      {isPaymentAmountDisplay ? payableAmount() : null}
    </>
  );
}

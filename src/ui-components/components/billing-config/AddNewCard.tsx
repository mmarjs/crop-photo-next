/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
import React, { Dispatch, SetStateAction, useState } from "react";
import styles from "../../../styles/AddNewCard.module.css";
import { Input } from "antd";
import StripeElement from "./StripeElement";
import { UserCardDetails } from "./UserCardDetails";
import CardModal from "./CardModal";
import { UserCardData } from "../../../common/Classes";
import { capitalize } from "lodash";
import { useTranslation } from "react-i18next";

export type AddNewCardProps = {
  planRate?: number;
  userCardData?: UserCardData;
  paymentRequired?: boolean;
  priceId?: string;
  customAmount?: boolean;
  setPaymentCallRequired?: Dispatch<SetStateAction<boolean>>;
  callType: string;
};

export default function AddNewCard({
  planRate,
  userCardData = new UserCardData(),
  paymentRequired = true,
  priceId = "",
  customAmount = false,
  setPaymentCallRequired,
  callType
}: AddNewCardProps) {
  let updateButton = false;
  const [amountValue, setAmountValue] = useState("");
  const { t } = useTranslation();

  function onChangeSaveAsDefaultCC() {}

  const updateCC = () => {};

  const payableAmount = () => {
    return (
      <>
        <div className={styles.amount}>Amount</div>
        <div className={styles.amountInputField}>{planRate ? <p>$ {planRate}</p> : null}</div>
      </>
    );
  };

  return (
    <>
      {userCardData.isEmpty() ? (
        priceId != "" ? (
          <StripeElement priceId={priceId} callType={callType} />
        ) : (
          <StripeElement amount={planRate} callType={callType} />
        )
      ) : (
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
            <StripeElement
              priceId={priceId}
              amount={planRate}
              userCardData={userCardData}
              setPaymentCallRequired={setPaymentCallRequired}
              callType={callType}
            />
            {/*{updateButton ? (*/}
            {/*<CardModal*/}
            {/*buttonText="Update"*/}
            {/*buttonClassname={styles.update}*/}
            {/*//@ts-ignore*/}
            {/*onOkClickHandle={() => updateCC()}*/}
            {/*buttonLabelClassName={styles.buttonLabelColor}*/}
            {/*buttonType="text"*/}
            {/*okButtonText={"Update"}*/}
            {/*modalTitle={"Update credit card"}*/}
            {/*width={576}*/}
            {/*>*/}
            {/*<StripeElement priceId={priceId} />*/}
            {/*</CardModal>*/}
            {/*) : null}*/}
          </div>
        </>
      )}

      {paymentRequired ? payableAmount() : null}
    </>
  );
}

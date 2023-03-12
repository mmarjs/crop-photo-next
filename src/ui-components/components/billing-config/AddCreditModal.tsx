import { Dispatch, SetStateAction, useEffect, useState } from "react";
import CardModal from "./CardModal";
import styles from "../../../styles/Billing.module.scss";
import { CustomerCurrentPlan, UserCardData } from "../../../common/Classes";
import { Button, Input } from "antd";
import { isValidNumber } from "../../../util/auth/string-util";
import Router from "next/router";
import { PLANS_PAGE } from "../../../lib/navigation/routes";
import { useTranslation } from "react-i18next";
import { Logger } from "aws-amplify";
import UserCardModal from "./UserCardModal";
import _ from "lodash";
import { BillingStructType } from "../../../redux/structs/billing";
import { connect, ConnectedProps } from "react-redux";
import { MarkerData } from "../../../models/MarkerData";
import { updateSelectedMarker } from "../../../redux/actions/smartcropActions";
import { updatePromoCodeValue } from "../../../redux/actions/billingActions";
import LearnMore from "../LearnMore";
import { ARTICLE_URL_ID } from "../../../common/Enums";

type PropsFromRedux = ConnectedProps<typeof connector>;
interface AddCreditModalProps extends PropsFromRedux {
  onPayClick: (e: any) => Promise<unknown>;
  customerPlan: CustomerCurrentPlan;
  userCardData: UserCardData;
  setCreditBalanceUpdated: Dispatch<SetStateAction<boolean>>;
  callType: string;
}

const AddCreditModal = ({
  onPayClick,
  customerPlan,
  userCardData,
  setCreditBalanceUpdated,
  callType,
  promoCode,
  updatePromoCodeValue
}: AddCreditModalProps) => {
  const [amountValue, setAmountValue] = useState<string>("");
  const [planRate, setPlanRate] = useState(0);
  const [isAmountEntryNeeded, setAmountEntryNeeded] = useState(false);
  const [isPaymentCallRequired, setPaymentCallRequired] = useState<boolean>(true);
  const { t } = useTranslation();
  const logger = new Logger("components.billing-config.AddCreditModal");
  const [stripeElementLoaded, setStripeElementLoaded] = useState<boolean>(false);
  const [closeCardModal, setCloseCardModal] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  const [amountSubmitted, setAmountSubmitted] = useState(false);

  const initializeState = () => {
    setAmountValue("");
    setPlanRate(0);
    setAmountEntryNeeded(true);
    setAmountSubmitted(false);
    setStripeElementLoaded(false);
    setCloseCardModal(false);
    setButtonLoading(false);
    updatePromoCodeValue("");
  };

  useEffect(() => {
    logger.debug("inside useeffect with stripeelement loaded as ", stripeElementLoaded);
    if (stripeElementLoaded) {
      if (userCardData.isEmpty()) {
        setButtonLoading(false);
      } else {
        if (isPaymentCallRequired) {
          logger.debug("Inside useeffect and payment required as true");
          onPayClick(null).then(
            response => {
              if (callType === "ADD_CREDITS") {
                logger.debug("Addcredit payclick success");
                setCreditBalanceUpdated(true);
                setCloseCardModal(true);
                setButtonLoading(false);
              } else if (callType === "OVERAGE") {
                logger.debug("OVERAGE payclick success");
                setCreditBalanceUpdated(true);
                setCloseCardModal(true);
                setButtonLoading(true);
              }
            },
            error => {
              logger.error("Error on payment for addCredit: ", error);
              setButtonLoading(false);
            }
          );
        } else {
          logger.debug("Inside useeffect and payment required as false");
          setCreditBalanceUpdated(true);
          setCloseCardModal(true);
          setButtonLoading(false);
        }
      }
    }
  }, [stripeElementLoaded, promoCode]);

  const onOkClickHandle = () => {
    return new Promise<void>((resolve, reject) => {
      logger.debug("Inside OnOkayClickHandle");
      if (callType === "OVERAGE") {
        logger.debug("Inside overage charge");
        setPlanRate(Math.abs(customerPlan.getOverageCharge()));
        setAmountSubmitted(true);
      }
      if ((customerPlan && customerPlan.getCurrentPlan() === "Free") || !customerPlan.getCurrentPlan()) {
        logger.debug("Inside OnOkayClickHandle with Free plan");
        Router.push(PLANS_PAGE);
        resolve();
      } else if (parseFloat(amountValue) > 0 && isAmountEntryNeeded) {
        logger.debug("Inside OnOkayClickHandle with amount value  ", amountValue);
        setPlanRate(parseFloat(amountValue));
        setAmountEntryNeeded(false);
        // setButtonLoading(true);
      }
      // else if (planRate <= 0 && !isAmountEntryNeeded) {
      //   logger.debug("Inside OnOkayClickHandle with amount value  ", amountValue);
      //   setPlanRate(parseFloat(amountValue));
      //   setAmountEntryNeeded(false);
      //   setButtonLoading(true);
      // }
      else if (userCardData.isEmpty()) {
        logger.debug("Inside OnOkayClickHandle and no default card saved");
        setButtonLoading(true);
        onPayClick(null).then(
          response => {
            setCreditBalanceUpdated(true);
            setButtonLoading(false);
            resolve();
          },
          error => {
            setButtonLoading(false);
            reject(error);
          }
        );
      } else if (planRate > 0) {
        setAmountSubmitted(true);
      }
    });
  };
  return (
    <CardModal
      buttonLabelClassName={styles.buttonLabelColor}
      onOkClickHandle={onOkClickHandle}
      buttonType="text"
      buttonText={callType === "ADD_CREDITS" ? t("billing.add_credit.title") : t("billing.overage_payment.pay_now")}
      buttonClassname={styles.addCredits}
      disableOk={
        callType === "OVERAGE"
          ? false
          : !customerPlan.getCurrentPlan() || customerPlan.getCurrentPlan() === "Free"
          ? false
          : !(parseInt(amountValue) > 0)
      }
      // disabled={true}
      okButtonText={
        callType === "ADD_CREDITS"
          ? !customerPlan.getCurrentPlan() || customerPlan.getCurrentPlan() === "Free"
            ? t("billing.add_credit.upgrade_plan")
            : !isAmountEntryNeeded && userCardData.isEmpty()
            ? t("billing.add_credit.save_card_and_pay")
            : t("billing.add_credit.add_credits_button")
          : t("billing.overage_payment.pay_now")
      }
      modalTitle={callType === "ADD_CREDITS" ? t("billing.add_credit.title") : t("billing.overage_payment.modal_title")}
      //@ts-ignore
      onButtonClick={() => {
        initializeState();
      }}
      isManualCloseModal={closeCardModal}
      buttonLoading={buttonLoading}
    >
      <div>
        {callType === "ADD_CREDITS" ? (
          <p>
            {!customerPlan.getCurrentPlan() ? (
              <>{t("billing.add_credit.desc_expired_plan")}</>
            ) : customerPlan.getCurrentPlan() === "Free" ? (
              <>{t("billing.add_credit.description_free_plan")}</>
            ) : (
              <>
                {t("billing.add_credit.description_paid_plan", { plan_name: customerPlan.getCurrentPlan() })} $
                {customerPlan.getPlanRate()}{" "}
                {customerPlan.getPlanDuration() === "month"
                  ? t("billing.add_credit.monthly")
                  : t("billing.add_credit.annually")}
              </>
            )}
            <LearnMore article={ARTICLE_URL_ID.ADD_CREDITS_MODAL_URL as string} />
          </p>
        ) : (
          <div>
            <p>
              {t("billing.overage_payment.description_pay_now_modal_line_1")}
              <br />
              <br />
              <b>{t("note_emphasis")}: </b>
              {t("billing.overage_payment.description_pay_now_modal_line_2")}
            </p>
          </div>
        )}
        {!customerPlan.getCurrentPlan() || customerPlan.getCurrentPlan() === "Free" ? (
          <div></div>
        ) : (
          <>
            <UserCardModal
              planRate={planRate}
              userCardData={userCardData}
              setPaymentCallRequired={setPaymentCallRequired}
              callType={callType}
              stripeElementLoaded={stripeElementLoaded}
              setStripeElementLoaded={setStripeElementLoaded}
              isPaymentAmountDisplay={!isAmountEntryNeeded}
              amountSubmitted={amountSubmitted}
            />

            {isAmountEntryNeeded && callType === "ADD_CREDITS" ? (
              <div>
                <div className={styles.AddCreditModalInputLabel}>Credits amount</div>
                <Input
                  className={styles.AddCreditModalInput}
                  placeholder={t("billing.add_credit.text_placeholder")}
                  value={amountValue}
                  onChange={e => {
                    if (isValidNumber(e.target.value)) {
                      setAmountValue(e.target.value.toString().replace(/\D/g, ""));
                    }
                  }}
                  type="text"
                />
              </div>
            ) : null}
          </>
        )}
      </div>
    </CardModal>
  );
};
// export default AddCreditModal;
const mapStateToProps = (state: { billing: BillingStructType }) => ({
  stripe: state.billing.stripe,
  elements: state.billing.elements,
  cs: state.billing.cs,
  promoCode: state.billing.promoCode
});
const mapDispatchToProps = (dispatch: any) => ({
  updatePromoCodeValue: (promoCode: string) => dispatch(updatePromoCodeValue(promoCode))
});
const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(AddCreditModal);

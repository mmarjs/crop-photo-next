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
import API from "../../../util/web/api";
import ProblemJson from "../../../util/web/problem-json";
import { ProblemJSONErrorCodeToMessageMapping } from "../../../util/exception/ProblemJsonErrorCodeToMesaageMapping";
import { toast } from "../toast";
import { mapErrorFromProblemJson, ProblemJsonException } from "../../../util/exception/problem-json-exception";

interface PayOverageModal {
  //onPayClick: (e: any) => Promise<unknown>;
  customerPlan: CustomerCurrentPlan;
  //userCardData: UserCardData;
  //setCreditBalanceUpdated: Dispatch<SetStateAction<boolean>>;
}

function isPaymentRequireAction(problemJson: ProblemJson) {
  return !!getPaymentUrl(problemJson);
}

function getPaymentUrl(problemJson: ProblemJson): string {
  if (problemJson.title === "invoice_payment_intent_requires_action") {
    let code = problemJson.getExtension("code");
    let invoiceId = problemJson.getExtension("invoice_id");
    let paymentUrl = problemJson.getExtension("payment_url");
    if (paymentUrl != null) {
      return paymentUrl.toString();
    }
  }
  return "";
}

type PayOverageModalProps = {};
const PayOverageModal = (props: PayOverageModal) => {
  const [amountValue, setAmountValue] = useState<number>(0);
  const { t } = useTranslation();
  const logger = new Logger("components:billing-config:PayOverageModal");
  const [stripeElementLoaded, setStripeElementLoaded] = useState<boolean>(false);
  const [closeCardModal, setCloseCardModal] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  const [amountSubmitted, setAmountSubmitted] = useState(false);

  // const initializeState = () => {
  //   setAmountValue("");
  //   setPlanRate(0);
  //   setAmountEntryNeeded(true);
  //   setAmountSubmitted(false);
  //   setStripeElementLoaded(false);
  //   setCloseCardModal(false);
  //   setButtonLoading(false);
  //   updatePromoCodeValue("");
  // };

  /*useEffect(() => {
    logger.debug("Inside useEffect with stripe element loaded as ", stripeElementLoaded);
    if (stripeElementLoaded) {
      if (userCardData.isEmpty()) {
        setButtonLoading(false);
      } else {
        if (isPaymentCallRequired) {
          logger.debug("Inside useeffect and payment required as true");
          onPayClick(null).then(
            response => {
              logger.debug("Addcredit payclick success");
              setCreditBalanceUpdated(true);
              setCloseCardModal(true);
              setButtonLoading(false);
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
  }, [stripeElementLoaded, promoCode]);*/

  /*const onOkClickHandle = () => {
    return new Promise((resolve, reject) => {
      logger.debug("Inside OnOkayClickHandle");
      if ((customerPlan && customerPlan.getCurrentPlan() === "Free") || !customerPlan.getCurrentPlan()) {
        logger.debug("Inside OnOkayClickHandle with Free plan");
        Router.push(PLANS_PAGE);
        resolve(null);
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
            resolve(response);
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
  };*/
  const onOkClickHandle = () => {
    return new Promise<void>((resolve, reject) => {
      setButtonLoading(true);
      API.chargeForOverage()
        .then(data => {
          toast(t("billing.overage_payment.payment_request_submitted"));
          setCloseCardModal(true);
        })
        .catch((error: Error) => {
          if (error instanceof ProblemJsonException) {
            const problemJson = error.problemJson;
            if (isPaymentRequireAction(problemJson)) {
              window.open(getPaymentUrl(problemJson), "_blank", "popup=yes");
            } else {
              toast(mapErrorFromProblemJson(error), "error");
            }
          } else {
            toast(error.message, "error");
          }
        })
        .finally(() => {
          setButtonLoading(false);
          resolve();
        });
    });
  };

  return (
    <CardModal
      buttonLabelClassName={styles.buttonLabelColor}
      onOkClickHandle={onOkClickHandle}
      buttonType="text"
      buttonText={t("billing.overage_payment.pay_now")}
      buttonClassname={styles.addCredits}
      // disabled={true}
      okButtonText={t("billing.overage_payment.pay_now")}
      modalTitle={t("billing.overage_payment.modal_title")}
      //@ts-ignore
      onButtonClick={() => {}}
      isManualCloseModal={closeCardModal}
      buttonLoading={buttonLoading}
    >
      <div>
        <p>
          {t("billing.overage_payment.description_pay_now_modal_line_1")}
          <br />
          <br />
          <b>{t("note_emphasis")}: </b>
          {t("billing.overage_payment.description_pay_now_modal_line_2")}
        </p>
      </div>
    </CardModal>
  );
};

export default PayOverageModal;

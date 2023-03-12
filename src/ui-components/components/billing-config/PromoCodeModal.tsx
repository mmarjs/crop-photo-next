import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Logger } from "aws-amplify";
import styles from "../../../styles/AddNewCard.module.css";
import { InputWithLabel } from "../composite/input-with-label";
import { Button } from "../button";
import API from "../../../util/web/api";
import { updatePromoCodeValue } from "../../../redux/actions/billingActions";
import { ProblemJSONErrorCodeToMessageMapping } from "../../../util/exception/ProblemJsonErrorCodeToMesaageMapping";
import { toast } from "../toast";
import { useDispatch } from "react-redux";
import { PlanDetails } from "../plan-config/PlanDetails";
import { PROMO_CODE_DURATION } from "../../../common/Enums";
import { Col, Row } from "antd";

export type PromoCodeModalProps = {
  amount?: number;
  plan?: PlanDetails;
};

export default function PromoCodeModal({ amount = 0, plan }: PromoCodeModalProps) {
  const { t } = useTranslation();
  const logger = new Logger("components.billing-config.PromoCodeModal");

  let imgRef = useRef<HTMLImageElement>(null);

  const dispatch = useDispatch();
  const [openPromoBox, setOpenPromoBox] = useState(true);
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoCodeValue, setPromoCodeValue] = useState("");
  const [percentOff, setPercentOff] = useState(0);
  const [amountOff, setAmountOff] = useState(0);
  const [promoCodeDuration, setPromoCodeDuration] = useState("");

  useEffect(() => {
    localStorage.setItem("PROMO_CODE", "");
  }, []);

  let onPromoCodeBlockOpen = () => {
    if (!imgRef) return;
    setOpenPromoBox(!openPromoBox);
    if (imgRef.current) {
      if (openPromoBox) imgRef.current.style.transform = "rotate(-180deg)";
      else imgRef.current.style.transform = "rotate(0deg)";
    }
  };

  let setPromoCodeTime = (duration: string) => {
    switch (duration) {
      case PROMO_CODE_DURATION.FOREVER:
        setPromoCodeDuration("Forever");
        break;

      case PROMO_CODE_DURATION.ONCE:
        setPromoCodeDuration("1st Month");
        break;

      case PROMO_CODE_DURATION.REPEATING:
        setPromoCodeDuration("Repeating");
        break;

      default:
        setPromoCodeDuration("");
        break;
    }
  };

  let addPromoCodeToBill = async () => {
    try {
      await API.addPromoCode(promoCodeValue, plan ? plan.priceId : "credit").then(response => {
        // let promoCode = new PromoCodeResponse();
        if (response?.data?.valid) {
          if (response.data?.percent_off === 0) {
            if (parseInt(response.data?.amount_off_in_cents) / 100 > amount) {
              toast(`This promo code is not valid for this ${plan ? `plan` : `credit`}. `, "error");
            } else {
              setAmountOff(parseInt(response.data?.amount_off_in_cents) / 100);
              localStorage.setItem("PROMO_CODE", promoCodeValue);
              dispatch(updatePromoCodeValue(promoCodeValue));
              setPromoCodeInput(promoCodeValue);
            }
          } else {
            setPercentOff(response.data?.percent_off);
            localStorage.setItem("PROMO_CODE", promoCodeValue);
            dispatch(updatePromoCodeValue(promoCodeValue));
            setPromoCodeInput(promoCodeValue);
          }
          setPromoCodeTime(response?.data?.coupon_duration);
        }
      });
    } catch (error: any) {
      let errorString: string = error?.problemJson?.type
        ? ProblemJSONErrorCodeToMessageMapping(error?.problemJson?.type)
        : error?.problemJson?.typedetail;
      toast(t(errorString), "error");
      logger.debug("addPromoCodeToBill error", error);
    }
  };

  const billSummary = () => {
    let totalDue =
      percentOff && percentOff !== 0
        ? (amount - (percentOff / 100) * amount).toFixed(2)
        : amountOff && amountOff !== 0 && amountOff < amount
        ? (amount - amountOff).toFixed(2)
        : Number(amount).toFixed(2);
    return (
      <div className={styles.billSummary}>
        <div className={styles.summaryHeading}>Summary</div>
        {showBillItems()}

        <div className={styles.divider} />

        <Row className={`${styles.totalBill} + ${styles.billItem}`}>
          <Col span={10}>Total</Col>
          <Col span={8} className={styles.leftAlign}>
            ${totalDue} due now
          </Col>
          <Col span={6} className={styles.rightAlign} />
        </Row>

        <div className={styles.bottomMsg}>Your plan will automatically renew.</div>
      </div>
    );
  };

  const showBillItems = () => {
    let discount =
      percentOff && percentOff !== 0
        ? ((percentOff / 100) * amount).toFixed(2)
        : amountOff && amountOff !== 0 && amountOff < amount
        ? amountOff
        : 0;
    let billItemName = plan ? `${plan.planName} Plan` : "Credits";
    let billItemAmount = plan ? `$${Number(amount).toFixed(2)}` : `$${Number(amount).toFixed(2)}`;

    let promoDuration = plan ? `${promoCodeDuration}` : "-";
    let planDuration = plan ? `per ${plan.planDuration}` : "-";

    return (
      <div>
        <Row className={styles.billItem}>
          <Col span={10}>{billItemName}</Col>
          <Col span={8} className={styles.leftAlign}>
            {billItemAmount}
          </Col>
          <Col span={6} className={styles.rightAlign}>
            {planDuration}
          </Col>
        </Row>

        {discount > 0 ? (
          <Row className={styles.billItem}>
            <Col span={10}>{promoCodeInput.toUpperCase()}</Col>
            <Col span={8} className={styles.leftAlign}>
              {`- $${discount}`}
            </Col>
            <Col span={6} className={styles.rightAlign}>
              {promoDuration}
            </Col>
          </Row>
        ) : null}
      </div>
    );
  };

  return (
    <div>
      <div className={styles.promoCodeHeading} onClick={() => onPromoCodeBlockOpen()}>
        <div className={styles.amount}> Add Promo Code</div>
        <img src={"/images/up_icon.svg"} className={styles.upIcon} ref={imgRef} />
      </div>
      {openPromoBox ? (
        <div className={styles.promoInput}>
          <InputWithLabel
            text={promoCodeValue}
            labelText={""}
            placeHolderText={"Enter Code"}
            OnChangeOfInputValue={(e: React.ChangeEvent<HTMLInputElement>) => {
              setPromoCodeValue(e.target.value.toUpperCase());
            }}
          />
          <Button label={"Add"} className={styles.addPromo} onClick={() => addPromoCodeToBill()} />
        </div>
      ) : null}

      {billSummary()}
    </div>
  );
}

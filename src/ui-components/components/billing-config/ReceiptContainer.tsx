import { useMemo } from "react";
import styles from "../../../styles/ReceiptContainer.module.css";
import { Col, Row } from "antd";
import date from "../../utils/date";
import { OBJECT_TYPE } from "../../../common/Types";
import { Tooltip } from "../tooltip";
import { useTranslation } from "react-i18next";

export type ReceiptContainerProps = {
  /**
   *
   */
  createdOn: string;
  paymentStatus: string;
  addedTopup: number;
  deductedTopup: number;
  addedSubscription: number;
  deductedSubscription: number;
  subscriptionBal: number;
  topupBalance: number;
  transactionType: string;
  details: string;
  transactionAmount: number;
  txnDetails: OBJECT_TYPE;
};

export default function ReceiptContainer({
  createdOn,
  paymentStatus,
  transactionType,
  transactionAmount,
  txnDetails
}: ReceiptContainerProps) {
  const { t } = useTranslation();

  const transactionTypeMap: OBJECT_TYPE = {
    TOP_UP: t("billing.receipt.top_up"),
    SUBSCRIPTION: t("billing.receipt.subscription"),
    JOB: t("billing.receipt.charge"),
    CHARGE: t("billing.receipt.charge"),
    OVERAGE: "Overage"
  };

  // const [charge, setCharge] = useState<string>("");

  // useEffect(() => {
  //   // let charge: string = "";
  //   if (deductedSubscription) {
  //     setCharge(`-${DEFAULT_CURRENCY}${deductedSubscription}`);
  //   } else {
  //     if (deductedTopup) {
  //       setCharge(`-${DEFAULT_CURRENCY}${deductedTopup}`);
  //     } else {
  //       if (addedTopup) {
  //         setCharge(`+${DEFAULT_CURRENCY}${addedTopup}`);
  //       } else {
  //         if (addedSubscription) {
  //           setCharge(`+${DEFAULT_CURRENCY}${addedSubscription}`);
  //         } else {
  //           setCharge("");
  //         }
  //       }
  //     }
  //   }
  // }, [deductedSubscription, deductedTopup, addedTopup, addedSubscription]);

  const finalAmt = useMemo(() => {
    let roundedAmt = parseFloat(transactionAmount.toFixed(2));
    if (roundedAmt < 0) {
      return (
        roundedAmt.toString().substring(0, 1) +
        "$" +
        roundedAmt.toString().substring(1, transactionAmount.toString().length)
      );
    } else {
      return `$${roundedAmt.toString()}`;
    }
  }, [transactionAmount]);

  let statusTag = null;
  if (paymentStatus) {
    // if (paymentStatus.toLowerCase() === "initiated") {
    //   statusTag = (
    //     <Tooltip title={details} placement="top">
    //       <Tag icon={<ClockCircleOutlined />} color="default">
    //         Waiting
    //       </Tag>
    //     </Tooltip>
    //   );
    // } else
    if (paymentStatus.toLowerCase() === "succeeded") {
      statusTag = (
        // <Tooltip title={details} placement="top">
        //   <Tag icon={<CheckCircleOutlined />} color="success">
        //     Success
        //   </Tag>
        // </Tooltip>
        <div className={styles.statusPill}>
          {/*<div className={styles.successCircle}></div>*/}
          {/*{t("billing.receipt.paid")}*/}
        </div>
      );
    }
    if (paymentStatus.toLowerCase() === "failed") {
      statusTag = (
        <Tooltip title={txnDetails?.stripe_error_message} placement="top">
          <div className={styles.statusPill}>
            <div className={styles.failedCircle}></div>
            {t("billing.receipt.failed")}
          </div>
        </Tooltip>
      );
    }
  }

  return (
    <>
      {/* <div className={styles.receiptContainer}>
        <Row>
          <Col xs={9} sm={9} md={5} lg={4} xl={4}>
            <div className={styles.recieptInfo}>{receiptDate}</div>
          </Col>
          <Col xs={4} sm={4} md={4} lg={4} xl={4}>
            <div className={styles.recieptInfo}>{receiptStatus}</div>
          </Col>
          <Col xs={0} sm={0} md={9} lg={10} xl={12}></Col>
          <Col xs={5} sm={5} md={3} lg={3} xl={2}>
            <div className={styles.recieptAmount}>
              {DEFAULT_CURRENCY}
              {receiptAmount}
            </div>
          </Col>
          <Col xs={5} sm={5} md={3} lg={3} xl={2}>
            <a className={styles.viewReciept} href={receiptViewLink}>
              View
            </a>
          </Col>
        </Row>
      </div> */}
      <div className={styles.receiptContainer}>
        <Row justify="space-between" align="middle" wrap={false}>
          <Col span={5}>
            <div className={styles.receiptInfo}>{`${date(createdOn).format("ll")}`}</div>
          </Col>

          {/* <Col span={3}>
            <div className={styles.recieptInfo}>
              {DEFAULT_CURRENCY}
              {receiptTopUpAdded}
            </div>
          </Col> */}
          {/*<Col span={3}>
            <div className={styles.recieptInfo}>{DEFAULT_CURRENCY}{receiptTopUpDeducted}</div>

          </Col> */}
          {/* <Col span={3}>
            <div className={styles.recieptInfo}>
              {DEFAULT_CURRENCY}
              {receiptSubscriptionAdded}
            </div>
          </Col> */}
          {/*/!* <Col span={3}>*/}
          {/*   <div className={styles.receiptInfo}>*/}
          {/*     {DEFAULT_CURRENCY}*/}
          {/*     {receiptSubscriptionDeducted}*/}
          {/*   </div>*/}
          {/* </Col>*!/*/}

          <Col span={12}>
            <div className={styles.receiptInfo}>{transactionTypeMap[transactionType]}</div>
          </Col>

          {/*<Col span={3}>*/}
          {/*  <div className={styles.receiptInfo}>*/}
          {/*    {transactionType === "TXN_TOP_UP" && receiptTopUpAdded}*/}
          {/*    {transactionType === "TXN_SUBSCRIPTION" && receiptSubscriptionAdded}*/}
          {/*  </div>*/}
          {/*</Col>*/}
          <Col span={4}>
            <div className={styles.receiptInfo}>{statusTag}</div>
          </Col>
          <Col span={2}>
            <div className={styles.recieptAmount}>{finalAmt}</div>
          </Col>
        </Row>
      </div>
    </>
  );
}

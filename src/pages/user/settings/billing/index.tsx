import { useEffect, useState } from "react";
import { LeftPanel } from "../../../../ui-components/components/left-panel";
import styles from "../../../../styles/Billing.module.scss";
import { Breadcrumbs } from "../../../../ui-components/components/breadcrumb";
import { PLANS_PAGE, redirectToPath, SETTINGS_PAGE } from "../../../../lib/navigation/routes";
import { Button } from "../../../../ui-components/components/button";
import { Col, Row, Skeleton } from "antd";
import { useRouter } from "next/router";
import ReceiptContainer from "../../../../ui-components/components/billing-config/ReceiptContainer";
import { useTranslation } from "react-i18next";
import CardModal from "../../../../ui-components/components/billing-config/CardModal";
import AddNewCard from "../../../../ui-components/components/billing-config/AddNewCard";
import { HTTP } from "../../../../util/web/http-client";
import { ProblemJson } from "../../../../util/web/problem-json";
import API from "../../../../util/web/api";
import { Logger } from "aws-amplify";
import { DEFAULT_CURRENCY } from "../../../../ui-components/utils/Constants";
import { CustomerCurrentPlan, UserCardData } from "../../../../common/Classes";
import { connect, ConnectedProps } from "react-redux";
import BillingController from "../../../../controller/BillingController";
import { StringUtil } from "../../../../ui-components/utils";
import AddCreditModal from "../../../../ui-components/components/billing-config/AddCreditModal";
import { BillingStructType } from "../../../../redux/structs/billing";
import { Dispatch } from "redux";
import { JSON_TYPE } from "../../../../common/Types";
import { toast } from "../../../../ui-components/components/toast";
import _ from "lodash";
import { t } from "i18next";
import date from "../../../../ui-components/utils/date";

type PropsFromRedux = ConnectedProps<typeof connector>;

interface BillingPageProps extends PropsFromRedux {}

type CurrentBalanceProps = {
  customerPlan: CustomerCurrentPlan;
  onPayClick: () => Promise<unknown>;
  userCardData: UserCardData;
  setCreditBalanceUpdated: (value: ((prevState: boolean) => boolean) | boolean) => void;
};

function CurrentBalance(props: CurrentBalanceProps) {
  return (
    <Col span={4} className={styles.balanceContainer}>
      <p className={styles.balanceTitle}>{t("billing.current_balance")}</p>
      <p className={styles.balance}>
        {DEFAULT_CURRENCY}
        {parseFloat(props.customerPlan.getCurrentBalance()).toFixed(2)}
      </p>
      <AddCreditModal
        onPayClick={props.onPayClick}
        customerPlan={props.customerPlan}
        userCardData={props.userCardData}
        setCreditBalanceUpdated={props.setCreditBalanceUpdated}
        callType={"ADD_CREDITS"}
      />
    </Col>
  );
}

type OverageBalanceProps = {
  customerPlan: CustomerCurrentPlan;
  onPayClick: () => Promise<unknown>;
  userCardData: UserCardData;
  setCreditBalanceUpdated: (value: ((prevState: boolean) => boolean) | boolean) => void;
};

function OverageBalance(props: OverageBalanceProps) {
  return props.customerPlan.getOverageCharge() != 0 ? (
    <Col span={4} className={styles.balanceContainer}>
      <p className={styles.balanceTitle}>{t("billing.current_overage")}</p>
      <p className={styles.balance}>
        {DEFAULT_CURRENCY}
        {(props.customerPlan.getOverageCharge() * -1).toFixed(2)}
      </p>
      {/*<PayOverageModal customerPlan={props.customerPlan}/>*/}
      <AddCreditModal
        onPayClick={props.onPayClick}
        customerPlan={props.customerPlan}
        userCardData={props.userCardData}
        setCreditBalanceUpdated={props.setCreditBalanceUpdated}
        callType={"OVERAGE"}
      />
    </Col>
  ) : null;
}

type NextChargeProps = {
  customerPlan: CustomerCurrentPlan;
};

function NextCharge(props: NextChargeProps) {
  const customerPlan = props.customerPlan;
  return (
    <Col span={4}>
      {customerPlan.getScheduledPlanName() && customerPlan.getPlanEndDate() ? (
        <>
          <p className={styles.balanceTitle}>
            {t("billing.scheduled_plan_desc", { plan_name: customerPlan.getScheduledPlanName() })}{" "}
            {date(customerPlan.getPlanEndDate(), "DD/MM/YYYY").format("ll")}
          </p>
        </>
      ) : customerPlan.getNextChargeDate() ? (
        <>
          <p className={styles.balanceTitle}>
            {t("billing.next_charge_date")} {date(customerPlan.getNextChargeDate(), "DD/MM/YYYY").format("ll")}
          </p>
          <p className={styles.balance}>
            {DEFAULT_CURRENCY}
            {customerPlan.getPlanRate()}
          </p>
        </>
      ) : customerPlan.getPlanEndDate() ? (
        <>
          <p className={styles.balanceTitle}>
            {t("billing.plan_end_desc", { current_plan: customerPlan.getCurrentPlan() })}
            {date(customerPlan.getPlanEndDate(), "DD/MM/YYYY").format("ll")}
          </p>
        </>
      ) : null}
    </Col>
  );
}

type CreditCardDetailsProps = {
  userCardData: UserCardData;
  cardDetails: (updateButton?: boolean) => JSX.Element;
  onAddCard: () => Promise<void>;
  addCardLoading: boolean;
};

function CreditCardDetails(props: CreditCardDetailsProps) {
  const cardDetails = props.cardDetails;
  return (
    <Col span={5} className={styles.cardDetailsCol}>
      {!props.userCardData.isEmpty() ? (
        <>{cardDetails(true)}</>
      ) : (
        <CardModal
          buttonText={t("billing.add_new_card_modal.button_text")}
          buttonClassname={styles.useDifferentCard}
          onOkClickHandle={props.onAddCard}
          buttonLabelClassName={styles.buttonLabelColor}
          buttonType="default"
          okButtonText={t("billing.add_new_card_modal.ok_button_text")}
          modalTitle={t("billing.add_new_card_modal.title")}
          width={576}
          buttonLoading={props.addCardLoading}
        >
          <AddNewCard paymentRequired={false} callType={"ADD_CARD"} />
        </CardModal>
      )}
    </Col>
  );
}

function BillingPage({ stripe, elements, cs, promoCode }: BillingPageProps) {
  const logger = new Logger("pages.user.settings.billing.index");
  const router = useRouter();
  const { t } = useTranslation();

  function changePlan() {
    redirectToPath(PLANS_PAGE, router, window);
  }

  const planDuration = "Monthly";
  const [loaded, setLoaded] = useState(false);
  const [customerPlanLoaded, setCustomerPlanLoaded] = useState(false);
  const [userCardDataLoaded, setUserCardDataLoaded] = useState(false);
  const [receiptArrayLoaded, setReceiptArrayLoaded] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [customerPlan, setCustomerPlan] = useState(new CustomerCurrentPlan());
  const [userCardData, setUserCardData] = useState(new UserCardData());
  const [receiptDataArray, setReceiptDataArray] = useState([]);
  const switchToPlan = planDuration === "Monthly" ? "Annual" : "Monthly";
  const [visible, setVisible] = useState(false);
  const [apiEndPoint, setAPIEndPoint] = useState<any>("/api/v1/billing/createNewStripeCustomer");
  const [apiResponse, setAPIResponse] = useState<any>("");
  const [customerId, setCustomerId] = useState("");
  const [creditBalanceUpdated, setCreditBalanceUpdated] = useState(true);
  const [addCardLoading, setAddCardLoading] = useState(false);

  let breadcrumbPathArray = [[t("settings.title"), SETTINGS_PAGE], [t("settings.billing")]];

  //currentPlan, planRate, currentBalance

  let onPayClick = () => {
    if (userCardData.isEmpty()) {
      return new Promise((resolve, reject) => {
        // logger.debug(`onPayclick from Billing page with stripe Object : ${stripe} and elements: ${elements}`);
        let returnUrl = window.location.href;
        BillingController.payment(stripe, elements, returnUrl).then(
          response => {
            resolve(response);
          },
          error => {
            reject(error);
          }
        );
      });
    } else {
      return new Promise((resolve, reject) => {
        let returnUrl = window.location.href;
        BillingController.addCredits(stripe, elements, returnUrl, cs).then(
          resp => {
            setCreditBalanceUpdated(true);
            resolve(resp);
          },
          error => {
            reject(error);
          }
        );
      });
    }
  };

  let onPayOverageClick = () => {
    console.log(" onPayOverageClick is clicked ");
    return new Promise((resolve, reject) => {
      let returnUrl = window.location.href;
      BillingController.addCredits(stripe, elements, returnUrl, cs).then(
        resp => {
          setCreditBalanceUpdated(true);
          resolve(resp);
        },
        error => {
          reject(error);
        }
      );
    });
  };

  let onAddCard = () => {
    return new Promise<void>((resolve, reject) => {
      logger.debug(`onPayclick from Billing page with stripe Object : ${stripe} and elements: ${elements}`);
      let returnUrl = window.location.href;
      setAddCardLoading(true);
      BillingController.addCard(stripe, elements, returnUrl).then(
        response => {
          setAddCardLoading(false);
          resolve();
        },
        error => {
          setAddCardLoading(false);
          reject(error);
        }
      );
    });
  };

  useEffect(() => {
    let paymentIntendId = new URLSearchParams(window.location.search).get("payment_intent");
    let setupIntentId = new URLSearchParams(window.location.search).get("setup_intent");
    if (StringUtil.isNotEmpty(paymentIntendId ? paymentIntendId : "")) {
      logger.debug(`Payment is successful`);
      API.retrievePaymentIntent(paymentIntendId ? paymentIntendId : "").then(({ data }) => {
        logger.debug("PAYMENT INTENT ::", data);
        toast("Payment successful", "success");
        router.replace("/user/settings/billing", undefined, { shallow: true });
        loadUserCardData();
      });
    } else if (StringUtil.isNotEmpty(setupIntentId ? setupIntentId : "")) {
      logger.debug(`Saving card is successful with setupintent id: ${setupIntentId}`);
      API.retrieveSetupIntent(setupIntentId ? setupIntentId : "").then(({ data }) => {
        logger.debug("SETUP INTENT ::", data);
        toast("Your credit card has been successfully added.", "success");
        router.replace("/user/settings/billing", undefined, { shallow: true });
        setUserCardDataLoaded(false);
        loadUserCardData();
      });
    } else {
      loadUserCardData();
    }
  }, []);

  useEffect(() => {
    logger.debug("creditBalanceUpdated in billing page", creditBalanceUpdated);
    if (creditBalanceUpdated) {
      logger.debug("creditBalanceUpdated in billing page as true", creditBalanceUpdated);
      API.getTransactions()
        .then(data => {
          setReceiptDataArray(data?.data?.entries);
          setReceiptArrayLoaded(true);
        })
        .catch(err => {
          console.error("Error in loading transactions");
        });
      loadCustomerPlan();
      //@ts-ignore
      userInfo?.currentPlan === "Free" ? redirectToPath(PLANS_PAGE, router, window) : null;
    }
  }, [creditBalanceUpdated]);

  const setInvoices = (invoiceList: any) => {
    logger.debug("invoices", invoiceList);
    setReceiptDataArray(invoiceList);
  };

  const loadCustomerPlan = () => {
    API.getCustomerPlan().then(data => {
      logger.debug("customer plans in billing page: ", data.data);
      customerPlan.setCurrentPlan(data.data.plan_name);
      customerPlan.setPlanRate(data.data.plan_rate);
      customerPlan.setPlanDuration(data.data.plan_duration);
      customerPlan.setNextChargeDate(data.data.next_charge_date);
      customerPlan.setPlanEndDate(data?.data?.status?.end_date);
      customerPlan.setScheduledPlanName(data?.data.scheduled_plan_name);
      setCustomerPlan(customerPlan);
      API.getCustomerBillingInfo().then(data => {
        logger.debug("customer billing info in billing page: ", data.data);
        customerPlan.setCurrentBalance(data.data.total_balance);
        customerPlan.setOverageCharge(data.data.overage_charge);
        setCustomerPlan(customerPlan);
        setCustomerPlanLoaded(true);
        setCreditBalanceUpdated(false);
      });
    });
  };

  const loadUserCardData = () => {
    API.getUserCardDetails().then(data => {
      logger.debug("user Card details in billing page: ", data.data);
      let userCardData = new UserCardData();
      userCardData.setCardType(data.data.user_card_details.card_type);
      userCardData.setCardExpireDate(data.data.user_card_details.expiry_date);
      userCardData.setCardNumber(data.data.user_card_details.last4_digits);
      userCardData.setPaymentMethodId(data.data.user_card_details.payment_method_id);
      setUserCardData(userCardData);
      setUserCardDataLoaded(true);
    });
  };

  function fetchUserInfo(params: any) {
    console.info("Sending test get call: ", apiEndPoint, "params", params);
    const httpResponse = HTTP.get(apiEndPoint, {
      queryStringParameters: params
    });
    httpResponse
      .onResponse((resp: { [p: string]: any }) => {
        console.log("HTTP Response", resp);
        setAPIResponse(resp);
        console.log("resp.data.isNewCustomer == ", resp.data.isNewCustomer);
        if (resp.data.isNewCustomer) {
          setCustomerId(resp.data.isNewCustomer);
          changePlan();
        } else {
          console.log(resp.data);
          //call to get user info
        }
        setLoaded(true);
      })
      .onError((problem: ProblemJson) => {
        setAPIResponse(problem.detail);
        console.log("HTTP Error", JSON.stringify(problem));
        httpResponse.cancel("Bla bla");
      });
  }

  let removeCard = () => {
    API.removeCard().then(data => {
      console.log("Remove card", data.data);
      if (data.data?.success) {
        loadUserCardData();
        toast("Your card is removed successfully.");
      } else {
        if (data.data.status_msg) {
          toast(data.data.status_msg, "error");
        }
      }
    });
  };

  const addCredits = () => {
    return new Promise((resolve, reject) => {});
  };
  const addNewCard = () => {};
  const updateCC = () => {};

  const switchPlan = () => {
    // setVisible(true);
  };
  const confirmSwitchPlan = () => {
    // setVisible(false);
  };
  const cardDetails = (updateButton = false) => {
    return (
      <>
        <div className={styles.cardDetailsWrapper}>
          <img
            src={
              userCardData.getCardType() == "mastercard"
                ? "/images/mastercard-icon.svg"
                : userCardData.getCardType() == "visa"
                ? "/images/visa-icon.svg"
                : ""
            }
            className={styles.cardType}
            alt={"Card"}
          />
          <div style={{}}>
            <p className={styles.cardDetail}>
              {t("billing.card_desc", {
                card_type: _.capitalize(userCardData.getCardType()),
                card_number: userCardData.getCardNumber()
              })}
            </p>
            <div className={styles.cardExpiryDate}>
              {t("billing.card_expires")} {userCardData.getCardExpireDate()}
            </div>

            {updateButton ? (
              <>
                <CardModal
                  buttonText={t("billing.update_credit.button_text")}
                  buttonClassname={styles.update}
                  buttonLabelClassName={styles.buttonLabelColor}
                  buttonType="text"
                  okButtonText={t("billing.update_credit.okButton_text")}
                  onOkClickHandle={onAddCard}
                  modalTitle={t("billing.update_credit.modal_title")}
                  width={576}
                  buttonLoading={addCardLoading}
                >
                  <AddNewCard paymentRequired={false} callType="ADD_CARD" />
                </CardModal>
                <Button
                  type="text"
                  className={styles.removeCardButton}
                  labelClassName={styles.balanceTitle}
                  label={t("billing.remove_card")}
                  onClick={removeCard}
                />
              </>
            ) : null}
          </div>
        </div>
      </>
    );
  };

  return (
    <div style={{ height: "100vh", display: "flex" }}>
      <LeftPanel selectedPage="Settings" />

      <div style={{ background: "#FAFAFB", height: "100%", width: "100%", overflow: "scroll" }}>
        <div className={styles.Header}>
          <Breadcrumbs pathArray={breadcrumbPathArray} />
        </div>

        <div className={styles.billingWrapper}>
          <div className={styles.planStatusContainer}>
            {customerPlanLoaded ? (
              <>
                {customerPlan.getCurrentPlan() ? (
                  <div className={styles.planStatus}>
                    {t("billing.plan_desc.desc", { current_plan: customerPlan.getCurrentPlan() })}
                    <div className={styles.planRate}>
                      {DEFAULT_CURRENCY}
                      {/* {customerPlan.getPlanRate()} per {customerPlan.getPlanDuration()} */}
                      {t("billing.plan_desc.per_month", {
                        plan_rate: customerPlan.getPlanRate(),
                        plan_duration: customerPlan.getPlanDuration()
                      })}
                    </div>
                  </div>
                ) : (
                  <div className={styles.planStatus}>{t("billing.plan_desc.expired")}</div>
                )}

                <Button className={styles.changePlan} label={t("billing.change_plan")} onClick={changePlan} />
              </>
            ) : (
              <Skeleton active paragraph={{ rows: 0 }} />
            )}
          </div>

          <Row align="middle" justify="space-between" className={styles.planUpdateContainer}>
            {userCardDataLoaded ? (
              <>
                <CurrentBalance
                  customerPlan={customerPlan}
                  onPayClick={onPayClick}
                  userCardData={userCardData}
                  setCreditBalanceUpdated={setCreditBalanceUpdated}
                />
                <OverageBalance
                  customerPlan={customerPlan}
                  onPayClick={onPayOverageClick}
                  userCardData={userCardData}
                  setCreditBalanceUpdated={setCreditBalanceUpdated}
                />
                {userCardData.getCardType() != "" ? <NextCharge customerPlan={customerPlan} /> : <></>}
                <CreditCardDetails
                  userCardData={userCardData}
                  cardDetails={cardDetails}
                  onAddCard={onAddCard}
                  addCardLoading={addCardLoading}
                />
              </>
            ) : (
              <Skeleton active paragraph={{ rows: 0 }} />
            )}
          </Row>

          <div className={styles.recieptHeading}>{t("billing.receipt.heading")}</div>
          <div className={styles.divider} />
          {!receiptArrayLoaded ? (
            <div className={styles.recieptSkeleton}>
              {/* @ts-ignore */}
              <Skeleton active paragraph={{ rows: 0 }} block={true} />
              <Skeleton active paragraph={{ rows: 0 }} />
            </div>
          ) : receiptDataArray && receiptDataArray.length > 0 ? (
            <>
              <div className={styles.receiptContainer}>
                {receiptDataArray
                  .filter(
                    (item: JSON_TYPE) => item.transaction_type != "PRE_AUTH" && item.payment_status != "INITIATED"
                  )
                  .map((value: any, key) => (
                    <ReceiptContainer
                      key={value.id}
                      createdOn={value.created_on}
                      addedTopup={value.added_top_up}
                      deductedTopup={value.deducted_top_up}
                      addedSubscription={value.added_subscription}
                      deductedSubscription={value.deducted_subscription}
                      topupBalance={value.top_up_bal}
                      subscriptionBal={value.subscription_bal}
                      details={value.details}
                      //receiptNumber={value.invoice_id}
                      // receiptAmount={value.amount}
                      // receiptViewLink={value.status}
                      paymentStatus={value.payment_status}
                      transactionType={value.transaction_type}
                      transactionAmount={value.txn_amount}
                      txnDetails={value.txn_details}
                    />
                  ))}
              </div>
            </>
          ) : (
            <div className={styles.noReceipt}>No Receipts Available</div>
          )}
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state: { billing: BillingStructType }) => ({
  stripe: state.billing.stripe,
  elements: state.billing.elements,
  cs: state.billing.cs,
  promoCode: state.billing.promoCode
});
//@ts-ignore
const mapDispatchToProps = (dispatch: Dispatch) => ({});
const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(BillingPage);

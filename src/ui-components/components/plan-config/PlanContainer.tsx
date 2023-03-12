/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { CurrentPlan, PlanDetails } from "./PlanDetails";
import { useEffect, useMemo, useState } from "react";
import styles from "../../../styles/PlanContainer.module.css";
import API from "../../../util/web/api";
import { PlanDuration, PlanUpdate } from "../../enums";
import { DowngradeContainer } from "./DowngradeContainer";
import { Logger } from "aws-amplify";
import { connect, ConnectedProps } from "react-redux";
import { BillingStructType } from "../../../redux/structs/billing";
import BillingController from "../../../controller/BillingController";
import { UserCardData } from "../../../common/Classes";
import { Dispatch } from "redux";
import isEmpty from "lodash/isEmpty";
import noop from "lodash/noop";
import { useTranslation } from "react-i18next";
import { useIntercom } from "react-use-intercom";
import { CustomModal } from "../modal";
import SelectPlanActionGroup from "./SelectPlanActionGroup";
import UpgradePlanModal from "../billing-config/UpgradePlanModal";
import { CancelUpcomingPlanContent } from "./CancelUpcomingPlanContent";
import { CancelPlanContent } from "./CancelPlanContent";
import { toast } from "../toast";
import { useRouter } from "next/router";
import { usePricingPlanAtom } from "../../../jotai";

const getPlanType = (userPlan: PlanDetails, selectedPlan: PlanDetails, currentPlan: CurrentPlan | undefined) => {
  if (userPlan.planDuration === PlanDuration.YEARLY) {
    //same yearly plan but user plan is higher plan level, downgrade to selected plan
    if (currentPlan?.is_expired === true) {
      return PlanUpdate.UPGRADE;
    }
    if (
      (selectedPlan.planDuration === PlanDuration.YEARLY || selectedPlan.planDuration === PlanDuration.WEEKLY) &&
      selectedPlan.planLevel < userPlan.planLevel
    ) {
      return PlanUpdate.DOWNGRADE;
    }
    //same yearly plan but user plan is lower plan level, upgrade to selected plan
    if (selectedPlan.planDuration === PlanDuration.YEARLY && selectedPlan.planLevel > userPlan.planLevel) {
      return PlanUpdate.UPGRADE;
    }

    return PlanUpdate.DOWNGRADE;
  }

  if (userPlan.planDuration === PlanDuration.MONTHLY) {
    //same monthly plan but user plan is higher plan level, downgrade to selected plan
    if (currentPlan?.is_expired === true) {
      return PlanUpdate.UPGRADE;
    }
    if (
      (selectedPlan.planDuration === PlanDuration.MONTHLY || selectedPlan.planDuration === PlanDuration.WEEKLY) &&
      selectedPlan.planLevel < userPlan.planLevel
    ) {
      return PlanUpdate.DOWNGRADE;
    }
    //same yearly plan but user plan is lower plan level, upgrade to selected plan
    if (selectedPlan.planDuration === PlanDuration.MONTHLY && selectedPlan.planLevel > userPlan.planLevel) {
      return PlanUpdate.UPGRADE;
    }

    return PlanUpdate.UPGRADE;
  }

  return PlanUpdate.UPGRADE;
};

const getDurationLabel = (planDuration: string) => {
  return planDuration === PlanDuration.MONTHLY ? "per month" : planDuration === PlanDuration.YEARLY ? "per year" : "";
};

type PropsFromRedux = ConnectedProps<typeof connector>;
interface PlanContainerProps extends PropsFromRedux {
  planDescriptionArray?: string;
  userPlan: PlanDetails;
  selectedPlan: PlanDetails;
  onSelectPlan?: (id: number) => void;
  clientSecret?: string;
  userCardData?: UserCardData;
  setChangeInPlan?: Function;
  onSuccessfulPayment: (onSuccess: (done: boolean) => void) => void;
  recommendedPlan?: PlanDetails | undefined;
  currentPlan: CurrentPlan | undefined;
}

const PlanContainer = ({
  userPlan,
  onSelectPlan,
  userCardData = new UserCardData(),
  stripe,
  elements,
  selectedPlan,
  onSuccessfulPayment,
  recommendedPlan,
  setChangeInPlan,
  cs,
  promoCode,
  paymentRequired,
  currentPlan
}: PlanContainerProps) => {
  const logger = new Logger("ui-components:components:plan-config:PlanContainer");
  const router = useRouter();
  const [isPlanExpired, setIsPlanExpired] = useState<boolean>(false);
  const [isPlanTypeToDowngrade, setIsPlanTypeToDowngrade] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [downgradeReason, setDowngradeReason] = useState<string>("");
  const [showPlanModal, setShowPlanModal] = useState(false);
  const { planStatus, planLevel, planName, planRate, planDuration, priceId, planDescription } = selectedPlan;
  const { t } = useTranslation();
  const { trackEvent } = useIntercom();
  const descArray = planDescription.split(", ");
  const isPlanToCancel =
    !currentPlan?.is_expired &&
    (selectedPlan.priceId === userPlan?.priceId ||
      (!!selectedPlan && !!selectedPlan?.planStatus && !isEmpty(selectedPlan?.planStatus?.start_date)));
  const [stripeElementLoaded, setStripeElementLoaded] = useState<boolean>(false);
  const [isPaymentCallRequired, setPaymentCallRequired] = useState<boolean>(true);
  const [pricingPlan, setPricingPlan] = usePricingPlanAtom();

  useEffect(() => {
    logger.debug("Promo Code in Plan Container: ", promoCode);
    logger.debug("price id in local storage", localStorage.getItem("SUBSCRIPTION_PRICE_ID"));
    if (priceId === localStorage.getItem("SUBSCRIPTION_PRICE_ID")) {
      logger.debug("price id is matched with localstorage", priceId);
      let prCode = localStorage.getItem("PROMO_CODE");
      if (prCode)
        API.updateSubscription(priceId as string, prCode).then(response => {
          logger.debug("update subscription is succesful for price id and removing from local storage: ", priceId);
          localStorage.removeItem("SUBSCRIPTION_PRICE_ID");
          if (setChangeInPlan) setChangeInPlan(true);
        });
    }
  }, [promoCode]);

  useEffect(() => {
    logger.debug("paymentRequired in planContainer :", paymentRequired);
    if (!paymentRequired) {
      setShowPlanModal(false);
      onSuccessfulPayment(() => noop);
    }
  }, [paymentRequired]);

  useEffect(() => {
    if (pricingPlan === planName?.toLowerCase()) {
      handleSelectNewPlan();
    }
  }, [pricingPlan, planName]);

  useEffect(() => {
    if (!!currentPlan && selectedPlan) {
      setIsPlanExpired(currentPlan.is_expired && currentPlan.price_id === selectedPlan.priceId);
    }
  }, [currentPlan, selectedPlan]);

  useEffect(() => {
    if (!!userPlan) {
      if (planLevel > 0) {
        const planType = getPlanType(userPlan, selectedPlan, currentPlan);
        setIsPlanTypeToDowngrade(planType === PlanUpdate.DOWNGRADE);
      } else {
        //plan is free
        setIsPlanTypeToDowngrade(true);
      }
    }
  }, [userPlan, selectedPlan]);

  const isPaymentRequiredForUpgrade = () => {
    return !userPlan || userPlan.planName === "Free" || !!currentPlan?.is_expired;
  };

  const handleSelectNewPlan = () => {
    setShowPlanModal(true);
  };

  const handleCloseModal = () => {
    setShowPlanModal(false);
    if (!isEmpty(downgradeReason)) {
      setDowngradeReason("");
    }
    if (pricingPlan) {
      setPricingPlan("");
      window.localStorage.removeItem("pricing_plan");
    }
  };

  const handleCancelUpcomingPlan = async () => {
    logger.debug("calling handleCancelUpcomingPlan");
    setIsUpdating(true);
    try {
      await API.cancelUpdate();
      await API.loadPlans();
      onSuccessfulPayment(() => noop);
    } catch (error: any) {
      logger.debug("onPayclick error", error);
    } finally {
      setIsUpdating(false);
    }
  };
  const handlePlanCancel = async () => {
    logger.debug("called handlePlanCancel");
    setIsUpdating(true);
    try {
      await API.cancelPlan().then(data => {
        if (!data.data?.status) {
          logger.debug("on CancelPlan click from plan container ");
          toast(data.data?.status_msg, "error");
        } else {
          toast("Plan Cancelled Successfully");
        }
      });
      await API.loadPlans();
      onSuccessfulPayment(() => noop);
    } catch (error: any) {
      logger.debug("onPayclick error", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const onPayClick = async (event: any) => {
    logger.debug("cs: ", cs, "promoCode in plan container:", promoCode);
    setIsUpdating(true);
    if (setChangeInPlan) setChangeInPlan(false); //This is required to get some change in changeinplan value after subscription.
    logger.debug("onPayclick from plan container");
    try {
      if (isPlanToCancel) {
        if (selectedPlan.priceId === userPlan.priceId) {
          await handlePlanCancel();
        } else {
          await handleCancelUpcomingPlan();
        }

        return;
      } else if (isPlanTypeToDowngrade && !isPaymentRequiredForUpgrade()) {
        logger.debug("onPayclick from plan container with plan type downgrade");
        await API.updateSubscription(priceId as string, promoCode);
        if (!isEmpty(downgradeReason)) {
          trackEvent("crop-subscription-changed", { reason: downgradeReason });
        }
        onSuccessfulPayment(() => noop);
        if (setChangeInPlan) setChangeInPlan(true);
        setIsUpdating(false);
        setShowPlanModal(false);
      } else if (userCardData.isEmpty()) {
        if (isPaymentRequiredForUpgrade()) {
          logger.debug("onPayclick from plan container with card data empty and payment required for upgrade");
          const returnUrl = window.location.href;
          BillingController.payment(stripe, elements, returnUrl).then(
            response => {
              if (setChangeInPlan) setChangeInPlan(true);
              setIsUpdating(false);
              setShowPlanModal(false);
            },
            error => {
              // setShowPlanModal(false);
              setIsUpdating(false);
            }
          );
        } else {
          logger.debug("onPayclick from plan container with card data empty and payment not required for upgrade");
          return new Promise((resolve, reject) => {
            let returnUrl = window.location.href;
            //API.updateSubscription(priceId as string).then(response => {
            logger.debug("setting price id in local storage: ", priceId);
            localStorage.setItem("SUBSCRIPTION_PRICE_ID", priceId);
            BillingController.addCard(stripe, elements, returnUrl).then(
              response => {
                setIsUpdating(false);
                setShowPlanModal(false);
                resolve(response);
              },
              error => {
                setIsUpdating(false);
                setShowPlanModal(false);
                reject(error);
              }
            );
            // });
          });
        }
      } else {
        if (isPaymentRequiredForUpgrade()) {
          logger.debug("onPayclick from plan container with card data not empty and payment required for upgrade");
          return new Promise((resolve, reject) => {
            let returnUrl = window.location.href;
            BillingController.addCredits(stripe, elements, returnUrl, cs).then(
              resp => {
                logger.debug("Add credit success on plan page with response", resp);
                setIsUpdating(false);
                setShowPlanModal(false);
                if (setChangeInPlan) setChangeInPlan(true);
                resolve(resp);
              },
              error => {
                logger.debug("Add credit failed on plan page with error ", error);
                setIsUpdating(false);
                // setShowPlanModal(false);
                reject(error);
              }
            );
          });
        } else {
          logger.debug("onPayclick from plan container with card data not empty and payment not required for upgrade");
          logger.debug("cs: ", cs, "promoCode in plan container:", promoCode);
          await API.updateSubscription(priceId as string, promoCode);
          if (!isEmpty(downgradeReason)) {
            trackEvent("crop-subscription-changed", { reason: downgradeReason });
          }

          onSuccessfulPayment(() => noop);
        }
      }
    } catch (error: any) {
      logger.debug("onPayclick error in plan page : ", error);
      setIsUpdating(false);
      setShowPlanModal(false);
    } finally {
      if (pricingPlan) {
        setPricingPlan("");
        window.localStorage.removeItem("pricing_plan");
      }
    }
  };

  const handleReasonChange = (reason: string) => {
    setDowngradeReason(reason);
  };

  const modalOkText = useMemo(() => {
    if (isPlanToCancel) {
      if (selectedPlan.priceId === userPlan.priceId) {
        return t("billing.cancel_plan.confirm");
      } else return t("billing.cancel_upcoming_plan.confirm");
    }
    if (isPlanTypeToDowngrade && !isPlanToCancel) {
      return t("billing.plan_container.downgrade", { planName });
    }

    if (userCardData.isEmpty()) {
      t("billing.proceed_to_payment");
    }
    return t("billing.subscribe");
  }, [isPlanTypeToDowngrade, userCardData, isPlanToCancel, planName]);

  const modalTitle = useMemo(() => {
    if (isPlanTypeToDowngrade && !isPlanToCancel) {
      return t("billing.plan_container.downgrade_from_to", {
        currentPlan: userPlan?.planName,
        newPlan: planName
      });
    }
    if (isPlanToCancel) {
      if (selectedPlan.priceId === userPlan.priceId) {
        return t("billing.cancel_plan.title");
      } else return t("billing.cancel_upcoming_plan.title");
    }
    return t("billing.plan_container.upgrade", { planName });
  }, [isPlanTypeToDowngrade, planName, userPlan, isPlanToCancel]);

  const modalContent = useMemo(() => {
    if (isPlanToCancel) {
      if (selectedPlan.priceId === userPlan.priceId) {
        return <CancelPlanContent planName={planName as string} />;
      } else return <CancelUpcomingPlanContent planName={planName as string} />;
    }
    if (isPlanTypeToDowngrade) {
      return (
        <DowngradeContainer
          userPlanName={userPlan?.planName as string}
          planName={planName as string}
          onReasonChange={handleReasonChange}
          userPlanEndDate={userPlan?.planStatus?.end_date}
        />
      );
    }
    return (
      <UpgradePlanModal
        promoCode={promoCode}
        selectedPlan={selectedPlan}
        userCardData={userCardData}
        priceId={priceId}
        callType={"SUBSCRIPTION"}
        isPaymentRequiredForUpgrade={isPaymentRequiredForUpgrade()}
        setStripeElementLoaded={setStripeElementLoaded}
        setPaymentCallRequired={setPaymentCallRequired}
      />
    );
  }, [isPlanTypeToDowngrade, isPlanToCancel]);

  return (
    <div>
      <div className={styles.planContainer}>
        <div>
          {(!recommendedPlan && selectedPlan?.isEssential()) ||
          (!!recommendedPlan &&
            !!recommendedPlan?.planMetaData &&
            recommendedPlan?.planMetaData?.recommended &&
            recommendedPlan.planName === selectedPlan.planName) ? (
            <img src={"/images/recommended.svg"} className={styles.recommended} />
          ) : null}

          <div className={styles.planName}>{planName}</div>
          <div className={styles.planRate}>
            {`$${planRate}`}
            <div className={styles.planDuration}>{getDurationLabel(planDuration as string)}</div>
          </div>
          <div>
            {descArray?.length > 0
              ? descArray.map((value: string, index: number) => (
                  <div key={index} className={styles.descItems}>
                    {value}
                  </div>
                ))
              : null}
          </div>
        </div>
        <div>
          <SelectPlanActionGroup
            isExpired={isPlanExpired}
            onLearnMoreClick={() => !!onSelectPlan && onSelectPlan(6031196)}
            planName={planName as string}
            isToDowngrade={isPlanTypeToDowngrade}
            isUserHasPlan={!!userPlan}
            isCurrentPlan={userPlan?.priceId === priceId}
            onSelectPlan={handleSelectNewPlan}
            isUpcomingPlan={isPlanToCancel}
          />
          {/* select plan modal */}
          <CustomModal
            visible={showPlanModal}
            okText={modalOkText}
            onOk={onPayClick}
            onCancel={handleCloseModal}
            cancelText="Cancel"
            title={modalTitle}
            width={600}
            type="danger"
            danger={isPlanTypeToDowngrade && !isPlanToCancel}
            buttonLoading={isUpdating}
            disableOk={
              ((isPlanTypeToDowngrade && isEmpty(downgradeReason)) ||
                (!isPlanTypeToDowngrade && !stripeElementLoaded)) &&
              !isPlanToCancel &&
              !paymentRequired
            }
          >
            {modalContent}
          </CustomModal>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: { billing: BillingStructType }) => ({
  stripe: state.billing.stripe,
  elements: state.billing.elements,
  cs: state.billing.cs,
  promoCode: state.billing.promoCode,
  paymentRequired: state.billing.paymentRequired
});
const mapDispatchToProps = (dispatch: Dispatch) => ({});
const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(PlanContainer);

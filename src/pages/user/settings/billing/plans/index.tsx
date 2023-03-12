/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LeftPanel } from "../../../../../ui-components/components/left-panel";
import styles from "../../../../../styles/PlansPage.module.css";
import { Breadcrumbs } from "../../../../../ui-components/components/breadcrumb";
import { SETTING_AND_BILLING_PAGE, SETTINGS_PAGE } from "../../../../../lib/navigation/routes";
import Skeleton from "antd/lib/skeleton";
import { useIntercom } from "react-use-intercom";
import API from "../../../../../util/web/api";
import PlanDetailsResponse, {
  CurrentPlan,
  PlanDetails
} from "../../../../../ui-components/components/plan-config/PlanDetails";
import { PlanDuration } from "../../../../../ui-components/enums/PlanDuration";
import { Logger } from "aws-amplify";
import { useTranslation } from "react-i18next";
import { UserCardData } from "../../../../../common/Classes";
import PlansCarousel from "./PlanCarousel";
import { StringUtil } from "../../../../../ui-components/utils";
import { useRouter } from "next/router";
import { toast } from "../../../../../ui-components/components/toast";
// import { mockPlans } from "../../../../../ui-components/utils/Constants";

const logger = new Logger("pages.user.settings.billings.plans");

function SelectPlans() {
  const [userCardData, setUserCardData] = useState(new UserCardData());
  const [loaded, setLoaded] = useState(false);
  const [clientSecret, setCS] = useState("");
  const [userPlanDetails, setUserPlanDetails] = useState<PlanDetails>();
  const [isChangeInPlan, setChangeInPlan] = useState(false);
  const [monthlyPlans, setMonthlyPlans] = useState<Array<PlanDetails>>([]);
  const [yearlyPlans, setYearlyPlans] = useState<Array<PlanDetails>>([]);
  const [planType, setPlanType] = useState<string>(PlanDuration.MONTHLY);
  //const [isLoadingPlans, setIsLoadingPlans] = useState<boolean>(false);
  const [currentPlan, setCurrentPlan] = useState<CurrentPlan | undefined>(undefined);
  const { showArticle } = useIntercom();
  const { t } = useTranslation();
  let breadcrumbPathArray = [
    [t("settings.title"), SETTINGS_PAGE],
    [t("billing.title"), SETTING_AND_BILLING_PAGE],
    [t("billing.change_plan")]
  ];

  const router = useRouter();

  // useEffect(() => {
  //   if (!isLoadingPlans && (currentPlan?.is_expired || userPlanDetails?.planName === "Free")) {
  //     setBreadcrumbPathArray([[t("settings.title"), SETTINGS_PAGE], [t("settings.select_plan")]]);
  //   }

  //   if (!isLoadingPlans && (!currentPlan?.is_expired && userPlanDetails?.planName !== "Free")) {
  //     setBreadcrumbPathArray([
  //       [t("settings.title"), SETTINGS_PAGE],
  //       [t("billing.title"), SETTING_AND_BILLING_PAGE],
  //       [t("billing.change_plan")]
  //     ]);
  //   }
  //   return () => {
  //     setBreadcrumbPathArray([[t("settings.title"), SETTINGS_PAGE]]);
  //   };
  // }, [userPlanDetails, isLoadingPlans, currentPlan]);

  useEffect(() => {
    logger.debug(`in useeffect of plan index page with change in plans: ${isChangeInPlan}`);
    let paymentIntendId = new URLSearchParams(window.location.search).get("payment_intent");
    let setupIntentId = new URLSearchParams(window.location.search).get("setup_intent");

    if (StringUtil.isNotEmpty(paymentIntendId ? paymentIntendId : "")) {
      logger.debug(`Payment is successful`);
      API.retrievePaymentIntent(paymentIntendId ? paymentIntendId : "").then(({ data }) => {
        console.log("PAYMENT INTENT ::", data);
        toast("Payment is successful", "success");
        router.replace("/user/settings/billing/plans", undefined, { shallow: true });
      });
    } else if (StringUtil.isNotEmpty(setupIntentId ? setupIntentId : "")) {
      logger.debug(`Saving card is successful with setupintent id: ${setupIntentId}`);
      //In plan page add card will only called during plan upgrade (if card is not saved and deduction is not required).
      API.retrieveSetupIntent(setupIntentId ? setupIntentId : "").then(async ({ data }) => {
        console.log("SETUP INTENT ::", data);
        logger.debug("onUseeffect of plan page with card data empty and payment not required for upgrade");
        toast("Your credit card has been successfully added.", "success");
        router.replace("/user/settings/billing/plans", undefined, { shallow: true });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isChangeInPlan) {
      logger.debug("in useEffect of plan page with change in plan as true");
      loadPlans();
      setChangeInPlan(false);
    }
  }, [isChangeInPlan]);

  useEffect(() => {
    logger.debug("in useEffect of plan page with first load or change in plan duration");
    loadPlans();
  }, []);

  const handleSelectPlan = useCallback(
    (id: number) => {
      showArticle(id);
    },
    [showArticle]
  );
  let loadPlans = async (onSuccess?: Function) => {
    try {
      //setIsLoadingPlans(true);
      logger.debug("loadPlans started");
      await API.loadPlans().then((data: any) => {
        logger.debug("loadPlans", data.data);
        const planDetails = new PlanDetailsResponse(data.data);
        let sortedPlanList = planDetails.sortPlans();
        setUserPlanDetails(planDetails.getUserPlan());
        logger.debug("sortedPlanList", sortedPlanList);

        const monthly = sortedPlanList.filter(p => p.isMonthly() || p.isWeekly());
        const yearly = sortedPlanList.filter(p => p.isYearly());
        const free = sortedPlanList.filter(p => p.planName.toUpperCase() == "FREE");

        setCurrentPlan(planDetails.getCurrentPlan());
        setMonthlyPlans(monthly);
        setYearlyPlans(yearly);
      });
    } catch (e: any) {
      logger.error("loadPlans error", e);
    } finally {
      loadUserCardDetails();
    }
  };

  let loadUserCardDetails = async () => {
    logger.debug("loading usercard details");
    API.getUserCardDetails()
      .then(response => {
        let userCardData = new UserCardData();
        if (response.data.is_success) {
          userCardData.setCardType(response.data.user_card_details.card_type);
          userCardData.setCardExpireDate(response.data.user_card_details.expiry_date);
          userCardData.setCardNumber(response.data.user_card_details.last4_digits);
          userCardData.setPaymentMethodId(response.data.user_card_details.payment_method_id);
          console.log("setting usercard details: ", userCardData);
          setUserCardData(userCardData);
        } else {
          setUserCardData(new UserCardData());
        }
      })
      .finally(() => {
        setLoaded(true);
      });
  };

  const topHeaderBar = useMemo(() => {
    return (
      <div className={styles.headingContainer}>
        <div className={styles.selectorButton}>
          <div
            style={{
              transform: planType === PlanDuration.YEARLY ? `translate(106px)` : `translate(0px)`
            }}
            className={styles.sliderDiv}
          />
          <div
            className={styles.firstOption}
            onClick={() => {
              setPlanType(PlanDuration.MONTHLY);
            }}
          >
            {t("billing.plans.monthly")}
          </div>
          <div
            className={styles.secondOption}
            onClick={() => {
              setPlanType(PlanDuration.YEARLY);
            }}
          >
            {t("billing.plans.yearly")}
          </div>
        </div>
      </div>
    );
  }, [planType, t]);

  return (
    <div style={{ height: "100vh", display: "flex" }}>
      <LeftPanel selectedPage="Settings" />

      <div style={{ background: "#FAFAFB", height: "100%", width: "100%", overflow: "scroll" }}>
        <div className={styles.Header}>
          <Breadcrumbs pathArray={breadcrumbPathArray} />
        </div>
        {topHeaderBar}
        <div className={styles.yearlyDiscount}>
          <span>{t("billing.yearly_discount_desc")}</span>
        </div>
        <div className={styles.planCarouselContainer}>
          <div>
            {!loaded ? (
              <div className={styles.planCarouselSkeletons}>
                {[...Array(4)].map((_, key) => {
                  return (
                    <div className={styles.SkeletonContainer} key={key}>
                      <Skeleton active paragraph={{ rows: 7 }} />
                    </div>
                  );
                })}
              </div>
            ) : null}
            {loaded && planType === PlanDuration.MONTHLY ? (
              <PlansCarousel
                plans={monthlyPlans}
                userCardData={userCardData}
                clientSecret={clientSecret}
                userPlanDetails={userPlanDetails}
                currentPlan={currentPlan}
                handleSelectPlan={handleSelectPlan}
                setChangeInPlan={setChangeInPlan}
                onSuccessfulPayment={loadPlans}
              />
            ) : null}
            {loaded && planType === PlanDuration.YEARLY ? (
              <PlansCarousel
                plans={yearlyPlans}
                userCardData={userCardData}
                clientSecret={clientSecret}
                userPlanDetails={userPlanDetails}
                currentPlan={currentPlan}
                handleSelectPlan={handleSelectPlan}
                setChangeInPlan={setChangeInPlan}
                onSuccessfulPayment={loadPlans}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SelectPlans;

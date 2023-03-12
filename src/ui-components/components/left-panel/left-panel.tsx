import classnames from "classnames";
import styles from "./left-panel.module.scss";
import { LogoContainer } from "./components/logo-container";
import { NavigationList } from "./components/navigation-list";
import { UserPanel } from "./components/user-panel";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";
import { HOME_PAGE, PLANS_PAGE, redirectToPath, SETTING_AND_BILLING_PAGE } from "../../../lib/navigation/routes";
import { NAVIGATION_MENU } from "../../../common/Enums";
import { BillingIcon, HomeIcon, HomeSelectedIcon, NoticeOutlined } from "../../assets";
import { NavigationListItem } from "./components/navigation-list/navigationList";
import { Divider } from "../divider";
import API from "../../../util/web/api";
import { usePricingPlanAtom } from "../../../jotai";

export type LeftPanelProps = {
  /**
   * Custom Styles.
   */
  selectedPage?: string;
};

function dispatchIntercomSurveyEvent() {
  // @ts-ignore
  if (window.Intercom) {
    const surveyId = 24302386;
    // noinspection TypeScriptUnresolvedFunction
    // @ts-ignore
    window.Intercom("startSurvey", surveyId);
    console.info("Send survey request to intercom. Survey id:", surveyId);
  } else {
    console.warn("Window.intercom is undefined/null");
  }
}

/**
 *
 * @param param0
 * @returns
 */
export function LeftPanel({ selectedPage = NAVIGATION_MENU.HOME }: LeftPanelProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [pricingPlan, setPricingPlan] = usePricingPlanAtom();

  function navigateToHome() {
    if (!!pricingPlan) {
      setPricingPlan("");
      window.localStorage.removeItem("pricing_plan");
    }
    redirectToPath(HOME_PAGE, router, window);
    console.info("****Redirect to Home Page");
  }

  function navigateToBilling() {
    API.getCustomerPlan().then(data => {
      if (!!data && data.data?.plan_rate === 0) {
        redirectToPath(PLANS_PAGE, router, window);
      } else {
        redirectToPath(SETTING_AND_BILLING_PAGE, router, window);
      }
    });
  }

  function getNavigationList() {
    return [
      {
        key: "homeTab",
        id: "homeTab",
        icon: selectedPage == NAVIGATION_MENU.HOME ? <HomeSelectedIcon /> : <HomeIcon />,
        label: t("home.home"),
        selected: selectedPage === NAVIGATION_MENU.HOME,
        onClick: navigateToHome
      }
    ];
  }

  let billingButton = (
    <NavigationListItem
      key="billing"
      icon={<BillingIcon />}
      label={t("settings.billing")}
      selected={false}
      onClick={navigateToBilling}
    />
  );
  const feedbackButton = (
    <NavigationListItem
      className="bot-launch-feedback"
      key="feedback"
      icon={<NoticeOutlined width={20} />}
      label={t("settings.feedback")}
      selected={false}
      onClick={() => dispatchIntercomSurveyEvent()}
    />
  );
  let divider = <Divider className={styles.divider} key="divider" />;
  let userPanel = <UserPanel selectedPage={selectedPage} key="user-panel" />;
  return (
    <div className={classnames(styles.leftPanel)}>
      <LogoContainer />
      <NavigationList
        navigationList={getNavigationList()}
        bottomItems={[billingButton, feedbackButton, divider, userPanel]}
      />

      {/**/}
    </div>
  );
}

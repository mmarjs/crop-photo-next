import React, { useCallback, useEffect, useState } from "react";
import { ActionCard } from "../../../ui-components/components/action-card";
// import {IconLock} from '../../../ui-components/assets/icons/icon-lock.svg';
import styles from "../../../styles/Settings.module.css";
// import { Button } from "../../../ui-components/components/button";
import {
  LOGOUT_PAGE,
  redirectToPath,
  SETTING_AND_BILLING_PAGE,
  SETTINGS_PAGE,
  SETTING_AND_DATA_PAGE,
  SETTING_AND_PROFILE_PAGE,
  LOGIN_PAGE,
  redirectToApplication,
  PLANS_PAGE,
  ALL_STATS_PAGE
} from "../../../lib/navigation/routes";
import { useRouter } from "next/router";
import { Breadcrumbs } from "../../../ui-components/components/breadcrumb";
import { LeftPanel } from "../../../ui-components/components/left-panel";
import AuthenticationController from "../../../controller/AuthenticationController";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { NAVIGATION_MENU } from "../../../common/Enums";
import { Divider } from "../../../ui-components/components/divider";
import { Button, Col, Row } from "antd";
import { Logger } from "aws-amplify";
import { useAuth } from "../../../hooks/useAuth";
import Optional from "../../../util/Optional";
import { UserDetails } from "../../../context/IAuthContext";
import API from "../../../util/web/api";
import { Feature } from "../../../util/feature-flag/FeatureFlag";
const logger = new Logger("pages:user:settings");

export default function Settings() {
  const { t } = useTranslation();

  const router = useRouter();
  const { user } = useAuth();
  // const {signOut} = useAuthenticator();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    setIsLoaded(false);
    logger.debug("in use effect of settings page");
    user().then((value: Optional<UserDetails>) => {
      if (value.isEmpty()) {
        redirectToPath(LOGIN_PAGE, router, window);
      } else {
        setIsLoaded(true);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onClick(route: string) {
    redirectToPath(route, router, window);
  }

  let breadcrumbPathArray = [[t("settings.title"), SETTINGS_PAGE]];

  function deleteAllCookies() {
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }

  const logout = () => {
    logger.info("logging out now...");
    //deleteAllCookies();
    AuthenticationController.signOut()
      .then(data => {
        logger.debug("Signed out success: ", data);
        //window.location.reload();
        redirectToPath(LOGOUT_PAGE, router, window);
      })
      .catch(error => {
        logger.warn("Error occurred in signed out:", error);
        //window.location.reload();
        redirectToPath(LOGOUT_PAGE, router, window);
      });
  };

  if (!isLoaded) {
    return <div />;
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        overflow: "hidden"
      }}
    >
      <LeftPanel selectedPage={NAVIGATION_MENU.SETTINGS} />
      <div style={{ background: "#FAFAFB", height: "100%", width: "100%" }}>
        <div className={styles.Header}>
          <Breadcrumbs pathArray={breadcrumbPathArray} />
        </div>
        <div className={styles.settingsContent}>
          <Row gutter={[40, 40]}>
            <Col>
              <ActionCard
                title={t("settings.profile_and_security")}
                description={t("settings.profile_and_security_desc")}
                icon={"/images/lock-icon.svg"}
                onClick={() => onClick(SETTING_AND_PROFILE_PAGE)}
              />
            </Col>
            <Col>
              <ActionCard
                title={t("settings.all_stats")}
                description={t("settings.all_stats_desc")}
                icon={"/images/stats.svg"}
                onClick={() => onClick(ALL_STATS_PAGE)}
              />
            </Col>
            <Col>
              <ActionCard
                title={t("settings.billing")}
                description={t("settings.billing_desc")}
                icon={"/images/creditcard-icon.svg"}
                onClick={() => {
                  API.getCustomerPlan().then(data => {
                    console.log("getCustomerPlan data", data);
                    if (!!data && data.data?.plan_rate === "0") {
                      console.log("plan rate", data.data?.plan_rate);
                      onClick(PLANS_PAGE);
                    } else {
                      onClick(SETTING_AND_BILLING_PAGE);
                    }
                  });
                }}
              />
            </Col>
            {/* <Col>
              <ActionCard
                title={t("settings.notifications")}
                description={t("settings.notifications_desc")}
                icon={"/images/notification-icon.svg"}
              />
            </Col> */}
            <Feature name="features.notificationBell">
              <Col>
                <ActionCard
                  title={t("settings.notifications")}
                  description={t("settings.notifications_desc")}
                  icon={"/images/notification-icon.svg"}
                />
              </Col>
            </Feature>
            <Col>
              <ActionCard
                title={t("settings.data")}
                description={t("settings.data_desc")}
                icon={"/images/cloud-icon.svg"}
                onClick={() => onClick(SETTING_AND_DATA_PAGE)}
              />
            </Col>
          </Row>
          <Divider className={styles.divider} />
          <Button size="large" onClick={logout} type="link">
            <div className={styles.settingsPageLogoutButton}>
              {t("settings.logout")}
              <div style={{ marginLeft: "0.65rem", marginTop: "6px" }}>
                <Image width={20} height={20} src="/images/logout-icon.svg" />
              </div>
            </div>
          </Button>
          <small className={styles.version}>{process.env.BUILD_VERSION}</small>
        </div>
      </div>
    </div>
  );
}

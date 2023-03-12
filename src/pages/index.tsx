import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import { Logger } from "aws-amplify";
import { useTranslation } from "react-i18next";

import { LOGIN_PAGE, redirectToPath } from "../lib/navigation/routes";
import { useRouter, withRouter } from "next/router";

import { LeftPanel } from "../ui-components/components/left-panel";
import { StartAutomation } from "../ui-components/home-components/start-automation";
import { Breadcrumbs } from "../ui-components/components/breadcrumb";
import { UserProjects } from "../ui-components/home-components/user-projects";
import { useIntercom } from "react-use-intercom";
import { useAuth } from "../hooks/useAuth";
import Optional from "../util/Optional";
import { UserDetails } from "../context/IAuthContext";
import API from "../util/web/api";
import CustomerIdResponse from "../ui-components/components/customer-config/CustomerIdResponse";
import { SMART_CROP_TYPE } from "../ui-components/smart-crop-components/jotai/atomTypes";
import { useAutomationType, useUpdateAutomationId } from "../ui-components/smart-crop-components/jotai/atomQueries";
import { usePricingPlanAtom } from "../jotai";
import { toast } from "../ui-components/components/toast";
import { AutomationType } from "../ui-components/enums/AutomationType";
import { ARTICLE_URL_ID } from "../common/Enums";
import {
  useGetandSetUnrecogCropName,
  useNewUnrecognizableCropConfig
} from "../ui-components/smart-crop-components/jotai/unrecognizableCrop/atomStore";
import {
  useNewRemoveBgResizeConfig,
  useRemoveBgResizeAutomationName
} from "../ui-components/smart-crop-components/jotai/removeBgResize/atomStore";
import { usePostCreateUnrecognizableCropConfig } from "../ui-components/smart-crop-components/jotai/unrecognizableCrop/atomMutations";
import { usePostRemoveBgResizeConfig } from "../ui-components/smart-crop-components/jotai/removeBgResize/atomMutations";
import {
  useGetandSetFaceCropName,
  useNewFaceCropConfig
} from "../ui-components/smart-crop-components/jotai/customFaceCrop/atomStore";
import { usePostCreateCustomFaceCropConfig } from "../ui-components/smart-crop-components/jotai/customFaceCrop/atomMutations";

const logger = new Logger("pages:index.tsx");

function Application(props: any) {
  const { t } = useTranslation();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const router = useRouter();
  const { editing } = router?.query;
  const breadcrumbPathArray = [[t("home.home"), ""]];
  const { trackEvent } = useIntercom();
  const [, setAutomationId] = useUpdateAutomationId();
  const newCropConfig = useNewUnrecognizableCropConfig(!editing);
  const [, setFaceCropName] = useGetandSetFaceCropName();
  const [, setUnrecogAutomationName] = useGetandSetUnrecogCropName();
  const [, setRemoveBgAndResizeName] = useRemoveBgResizeAutomationName();
  const [pricingPlan] = usePricingPlanAtom();
  const [, setAutomationType] = useAutomationType();
  const newCustomFaceCropConfig = useNewFaceCropConfig(!editing);
  const { mutate: createUnrecognizableConfig } = usePostCreateUnrecognizableCropConfig({
    onSuccess: (data: any) => {
      const automationResponse = data?.get();
      const automation = automationResponse.getAutomation();
      const automationId = automation.getAutomationId();
      setAutomationId(automationId);
      logger.info("****Redirect to unrecognizable crop configuration page");
      router?.push(`/unrecognizable-crop?automationId=${automationId}&step=0&status=CONFIGURED`);
    },
    onError: (error: any) => {
      console.error("createUnrecognizableConfig error", error);
      toast(error?.message ?? error.toString(), "error");
    }
  });
  const newRemoveBgResizeConfig = useNewRemoveBgResizeConfig();
  const { mutate: createRemoveBgResize } = usePostRemoveBgResizeConfig({
    onSuccess: (data: any) => {
      const automationResponse = data?.get();
      const automation = automationResponse.getAutomation();
      const automationId = automation.getAutomationId();
      setAutomationId(automationId);
      logger.info("****Redirect to remove bg resize configuration page");
      router?.push(`/remove-bg-resize?automationId=${automationId}&step=0&status=CONFIGURED`);
    },
    onError: (error: any) => {
      console.error("newRemoveBgResizeConfig error", error);
      toast(error?.message ?? error.toString(), "error");
    }
  });
  const { mutate: createCustomFaceCropConfig } = usePostCreateCustomFaceCropConfig();

  const { user } = useAuth();
  useEffect(() => {
    logger.debug("In useEffect home page. Calling onUser.");
    setIsLoaded(false);
    user().then((value: Optional<UserDetails>) => {
      if (value.isEmpty()) {
        logger.debug("In useEffect home page. onUser done. Moving to login page.");
        redirectToPath(LOGIN_PAGE, router, window);
      } else {
        logger.debug("In useEffect home page. onUser done. User found.");
        if (!!pricingPlan) {
          router?.push(`/user/settings/billing/plans`);
        } else {
          setIsLoaded(true);
        }
        //One time Fetch customer Id call on home page.
        logger.debug("Fetch customer id");
        API.fetchCustomerId().then(response => {
          let rs = new CustomerIdResponse(response.data);
          console.log(rs.customerId);
        });
      }
    });
    // eslint-disable-next-line
  }, []);

  function onSmartCropClick() {
    router.push("/smart-crop");
    logger.info("****Redirect to crop configuration page");
    trackEvent("crop-configure-start"); // This will allow us to track how much time did they spend in the configurator
  }

  const onUnrecognizableCropClick = () => {
    if (!newCropConfig || newCropConfig?.automation.type !== SMART_CROP_TYPE.UNRECOGNIZABLE_CROP) return;
    setUnrecogAutomationName("Untitled Unrecognizable Crop");
    setAutomationType(AutomationType.UNRECOGNIZABLE_CROP);
    createUnrecognizableConfig(newCropConfig);
    trackEvent("crop-configure-start");
  };
  const onCustomFaceCropClick = () => {
    if (!newCustomFaceCropConfig || newCustomFaceCropConfig?.automation.type !== SMART_CROP_TYPE.SMART_CROP) return;
    setFaceCropName("Untitled Custom Face Crop");
    setAutomationType(AutomationType.SMART_CROP);

    createCustomFaceCropConfig(newCustomFaceCropConfig, {
      onSuccess: (data: any) => {
        const automationResponse = data?.get();
        const automation = automationResponse.getAutomation();
        const automationId = automation.getAutomationId();
        setAutomationId(automationId);
        logger.info("****Redirect to unrecognizable crop configuration page");
        router?.push(`/custom-face-crop?automationId=${automationId}&step=0&status=CONFIGURED`);
      },
      onError: (error: any) => {
        console.error("createCustomFaceCrop error", error);
        toast(error?.message ?? error.toString(), "error");
      }
    });

    trackEvent("crop-configure-start");
  };
  const onRemoveBgResizeClick = () => {
    if (
      !newRemoveBgResizeConfig ||
      newRemoveBgResizeConfig?.config.automation.type !== SMART_CROP_TYPE.REMOVE_BG_RESIZE
    )
      return;
    setRemoveBgAndResizeName("Untitled Smart Resize + Background Remove");
    setAutomationType(AutomationType.REMOVE_BG_RESIZE);
    createRemoveBgResize(newRemoveBgResizeConfig.config);
    trackEvent("crop-configure-start");
  };

  /**
   *
   * @returns
   */
  function getAutomationOptions() {
    return [
      {
        id: "unrecognizableCrop",
        icon: "/images/unrecognizableCropIcon.svg",
        title: t("home.unrecognizable_crop"),
        onClick: onUnrecognizableCropClick,
        newBadge: true,
        article: ARTICLE_URL_ID.UNRECOGNIZABLE_FACE_CROP
      },
      {
        id: "removeBackground",
        icon: "/images/remove-bg-resize-icon.svg",
        title: t("home.remove_bg_resize"),
        onClick: onRemoveBgResizeClick,
        newBadge: true,
        article: ARTICLE_URL_ID.REMOVE_BG_RESIZE
      },
      // {
      //   id: "smartCrop",
      //   icon: "/images/smartCrop.svg",
      //   title: t("home.smart_crop"),
      //   onClick: onSmartCropClick,
      //   article: ARTICLE_URL_ID.CUSTOM_SMART_CROP
      // },
      {
        id: "customFaceCrop",
        icon: "/images/smartCrop.svg",
        title: t("home.smart_crop"),
        onClick: onCustomFaceCropClick,
        newBadge: true,
        article: ARTICLE_URL_ID.CUSTOM_SMART_CROP
      },
      {
        id: "listingAnalyzer",
        icon: "/images/listing-analyzer.svg",
        title: t("home.listing_analyzer"),
        description: t("home.coming_soon"),
        disabled: true,
        comingSoonBadge: true,
        article: ARTICLE_URL_ID.LISTING_ANALYZER

        // onClick: onSmartCropClick
      }

      // {
      //   id: "smartLabels",
      //   icon: "/images/smartLabels.svg",
      //   title: t("home.smart_labels"),
      //   description: t("home.coming_soon"),
      //   disabled: true
      // },
      // {
      //   id: "smartClip",
      //   icon: "/images/smartClip.svg",
      //   title: t("home.smart_clip"),
      //   description: t("home.coming_soon"),
      //   disabled: true
      // }
    ];
  }

  if (!isLoaded) {
    return <div />;
  }

  return (
    <div className={styles.homePage}>
      <LeftPanel selectedPage="Home" />
      <div className={styles.content}>
        <div className={styles.homeHeader}>
          <Breadcrumbs pathArray={breadcrumbPathArray} />
        </div>
        <div className={styles.homeContent}>
          <StartAutomation automationOptions={getAutomationOptions()} heading={t("home.start_automation")} />
          <UserProjects />
        </div>
      </div>
    </div>
  );
}

//export default Application;
let withRouter1 = withRouter(Application);
// @ts-ignore

export default withRouter1;

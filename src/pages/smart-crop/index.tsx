import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Logger } from "aws-amplify";
import { AUTOMATION_STATUS, JOB_STATUS } from "../../common/Enums";
import { getAutomationConfig } from "../../ui-components/components/smart-crop-config/smart-crop.service";
import SmartCropConfig from "../../ui-components/smart-crop/smart-crop-config";
// import SmartCropProgress from "../../ui-components/smart-crop/smart-crop-progress";
import { connect, ConnectedProps } from "react-redux";
import { Dispatch } from "redux";
import { OBJECT_TYPE, Photo } from "../../common/Types";
import {
  resetSmartCropConfig,
  updateAutomationName,
  updateCropPosition,
  updateCropSide,
  updateCropSize,
  updateCropType,
  updateJobId,
  updateMarker,
  updateMarkersBoundary,
  updateRemoveBackground,
  updateSmartCropStatus,
  updateUploadedMedia
} from "../../redux/actions/smartcropActions";
import SelectMedia from "../../ui-components/smart-crop/selectmedia";
import { SmartCropStructType } from "../../redux/structs/smartcrop";
import isEmpty from "lodash/isEmpty";
import { useAuth } from "../../hooks/useAuth";
import { LOGIN_PAGE, redirectToPath } from "../../lib/navigation/routes";
import SmartcropSummary from "../../ui-components/components/smartcrop-summary/smartcrop-summary";
import _ from "lodash";
import Optional from "../../util/Optional";
import AutomationResponse from "../../models/AutomationResponse";
import AutomationItem from "../../models/AutomationItem";
import { UserDetails } from "../../context/IAuthContext";

type SmartCropProps = ConnectedProps<typeof connector>;
const logger = new Logger("pages:smart-crop");

const SmartCrop = ({
  resetSmartCropConfig,
  updateMarker,
  updateCropSide,
  updateCropType,
  updateCropSize,
  updateMarkersBoundary,
  updateUploadedMedia,
  updateJobId,
  updateSmartCropStatus,
  smartCropStatus,
  updateAutomationName,
  updateRemoveBackground
}: SmartCropProps) => {
  const [currentStatus, setCurrentStatus] = useState<string>();

  const [displayView, setDisplayView] = useState<boolean>(false);
  const [hasConfig, setHasConfig] = useState<boolean>(false);

  const router = useRouter();
  const { user } = useAuth();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const queryElement = router?.query["automationId"];
  const automationId = queryElement ? queryElement.toString() : "";

  useEffect(() => {
    logger.debug("in use effect of smart-crop");
    if (!isLoaded) {
      setIsLoaded(false);
      user().then((value: Optional<UserDetails>) => {
        if (value.isPresent()) {
          setIsLoaded(true);
        } else {
          redirectToPath(LOGIN_PAGE, router, window);
        }
      });
    }
  }, [user]);
  console.log("handleGetAutomationConfig automationId", automationId);
  useEffect(() => {
    if (!_.isEmpty(automationId)) {
      if (isEmpty(currentStatus)) {
        handleGetAutomationConfig(automationId);
        setDisplayView(true);
      }
    }
    return () => {
      console.log("resetSmartCropConfig");
      resetSmartCropConfig();
    };
  }, [automationId]);

  const redirectToLogin = () => {
    redirectToPath(LOGIN_PAGE, router, window);
  };

  const onConfigSave = (status: string, nextScreenPath: string) => {
    logger.info("setting new status to render correct ui", status);
    setCurrentStatus(status);
    if (status === AUTOMATION_STATUS.RUNNING) {
      getAutomationConfig(automationId)
        .then((value: Optional<AutomationResponse>) => {
          if (value.isPresent()) {
            const automationResponse = value.get();
            const automation: AutomationItem | undefined = automationResponse.getAutomation();
            console.log("onConfigSave updateSmartCropStatus", status);
            updateSmartCropStatus(status);
            updateAutomationName(automation?.getName() || "");
            router.push(nextScreenPath);
          }
        })
        .catch(error => {
          logger.error(error);
        });
    } else {
      router.push(nextScreenPath);
    }
  };

  const onUploadedSuccess = (images: Photo[]) => {
    updateUploadedMedia(images);
  };

  const handleGetAutomationConfig = (id: string) => {
    logger.info("fetching automation config by id", id);
    getAutomationConfig(id)
      .then((value: Optional<AutomationResponse>) => {
        if (value.isPresent()) {
          const automationResponse = value.get();
          logger.debug("handleGetAutomationConfig response", automationResponse);

          const configDetails = automationResponse.getSmartCropConfigDetails();
          if (!!configDetails) {
            setHasConfig(true);
          }

          const automation: AutomationItem | undefined = automationResponse.getAutomation();
          const status: AUTOMATION_STATUS = automation ? automation.getStatus() : AUTOMATION_STATUS.CONFIGURED;
          const latestJobId = automationResponse.getLatestJobId();
          const automationName = automation?.getName();

          if (!smartCropStatus) {
            updateSmartCropStatus(status);
          }

          updateAutomationName(automationName || "");
          setCurrentStatus(status);
          updateJobId(latestJobId);
          updateCropType(automationResponse.getCropType() as string);
          updateCropSide(automationResponse.getCropSide() as string);
          updateMarker(automationResponse.getMarker());
          updateCropSize(automationResponse.getCropSize() as OBJECT_TYPE);
          updateMarkersBoundary(automationResponse.isIncludeMarkersBoundary() || false);
          updateRemoveBackground(automationResponse.getRemoveBackground() || false);
        }
      })
      .catch(error => {
        logger.error(error);
      });
  };

  if (!isLoaded) {
    return <div />;
  }

  if (router.isReady) {
    if (automationId) {
      if (currentStatus === AUTOMATION_STATUS.CONFIGURED) {
        return (
          <SelectMedia
            automationId={automationId}
            onConfigSave={onConfigSave}
            onUploadSuccess={onUploadedSuccess}
            updateJobId={updateJobId}
          />
        );
      }
      // if (currentStatus === AUTOMATION_STATUS.RUNNING) {
      //   return <SmartCropProgress automationId={automationId} />;
      // }
      if (currentStatus === AUTOMATION_STATUS.NOT_CONFIGURED) {
        return (
          <SmartCropConfig
            hasConfig={hasConfig}
            displayView={displayView}
            onConfigSave={onConfigSave}
            automationId={automationId}
          />
        );
      }
      if (currentStatus === AUTOMATION_STATUS.COMPLETED || currentStatus === AUTOMATION_STATUS.RUNNING) {
        return <SmartcropSummary automationId={automationId} />;
      }
    } else {
      return (
        <SmartCropConfig
          hasConfig={hasConfig}
          displayView={displayView}
          onConfigSave={onConfigSave}
          automationId={automationId}
        />
      );
    }
    return <div />;
  } else {
    return <div />;
  }
};

const mapStateToProps = (state: { smartcrop: SmartCropStructType }) => ({
  smartCropStatus: state.smartcrop.smartCropStatus
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  updateCropPosition: (position: OBJECT_TYPE) => dispatch(updateCropPosition(position)),
  updateCropSize: (size: OBJECT_TYPE) => dispatch(updateCropSize(size)),
  updateCropSide: (side: string) => dispatch(updateCropSide(side)),
  updateCropType: (type: string) => dispatch(updateCropType(type)),
  updateMarker: (marker: string) => dispatch(updateMarker(marker)),
  updateMarkersBoundary: (isIncludeMarkers: boolean) => dispatch(updateMarkersBoundary(isIncludeMarkers)),
  resetSmartCropConfig: () => dispatch(resetSmartCropConfig()),
  updateUploadedMedia: (images: Photo[]) => dispatch(updateUploadedMedia(images)),
  updateSmartCropStatus: (status: AUTOMATION_STATUS) => dispatch(updateSmartCropStatus(status)),
  updateJobId: (id: string) => dispatch(updateJobId(id)),
  updateAutomationName: (name: string) => dispatch(updateAutomationName(name)),
  updateRemoveBackground: (remove: boolean) => dispatch(updateRemoveBackground(remove))
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(SmartCrop);

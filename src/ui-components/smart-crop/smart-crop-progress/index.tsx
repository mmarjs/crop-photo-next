import React, { useEffect, useState } from "react";
// import { PhotoType } from "../../components/smart-crop-config/leftpanel/types";
import { SmartCropLeftPanel } from "../../components/smartcrop-leftpanel";
import { SmartCropNavbar } from "../../components/smartcrop-navbar";
import { SmartCropRightPanel } from "../../components/smartcrop-rightpanel";
// import { useRouter } from "next/router";
import API from "../../../util/web/api";
import { Logger } from "aws-amplify";
import { reject } from "lodash";
import { Dispatch } from "redux";
import { updateAutomationJob, updateJobId, updateSmartCropStatus } from "../../../redux/actions/smartcropActions";
import { connect, ConnectedProps } from "react-redux";
import { OBJECT_TYPE } from "../../../common/Types";
import AutomationResponse from "../../../models/AutomationResponse";
import Optional from "../../../util/Optional";
import AutomationItem from "../../../models/AutomationItem";
import AutomationJob from "../../../models/AutomationJob";
import { AUTOMATION_STATUS } from "../../../common/Enums";

type ReduxProps = ConnectedProps<typeof connector>;

export interface SmartCropProgressProps extends ReduxProps {
  automationId: string;
}

const SmartCropProgress = ({
  automationId,
  updateAutomationJob,
  updateJobId,
  updateSmartCropStatus
}: SmartCropProgressProps) => {
  const logger = new Logger("smart-crop:smart-crop-progress");

  // useEffect(() => {
  //   //TODO: improve implementation
  //   if (automationId) {
  //     logger.info("getAutomationJob", automationId);
  //     API.getAutomation(automationId, { jobIds: true })
  //       .then((value: Optional<AutomationResponse>) => {
  //         logger.info("getJobsByAutomationId response", value);
  //         const latestJobId = value.get().getLatestJobId();
  //         const automationStatus = value.get().getAutomationStatus();
  //         logger.debug("update jobId to redux", latestJobId);
  //         updateSmartCropStatus(automationStatus || "");
  //         updateJobId(latestJobId);
  //         return API.getAutomationJob(latestJobId)
  //           .then(response => {
  //             logger.info("getAutomationJob response", response);
  //             const data = response?.data;
  //             updateAutomationJob(data);
  //           })
  //           .catch(error => {
  //             logger.error("getAutomationJob error", error);
  //             reject(error);
  //           });
  //       })
  //       .catch(error => {
  //         logger.error(error);
  //         reject(error);
  //       });
  //   }
  // }, [automationId]);

  return (
    <>
      <SmartCropNavbar onDownload={() => {}} />
      <div style={{ display: "flex" }}>
        <SmartCropLeftPanel />
        <SmartCropRightPanel automationId={automationId} />
      </div>
    </>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  updateAutomationJob: (job: AutomationJob) => dispatch(updateAutomationJob(job)),
  updateJobId: (id: string) => dispatch(updateJobId(id)),
  updateSmartCropStatus: (status: string) => dispatch(updateSmartCropStatus(status))
});
const connector = connect(null, mapDispatchToProps);

export default connector(SmartCropProgress);

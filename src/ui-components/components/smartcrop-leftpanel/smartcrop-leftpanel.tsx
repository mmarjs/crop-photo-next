import React, { useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import styles from "./smartcrop-leftpanel.module.scss";
import { Divider } from "../divider";
// import { PauseButton } from "../pause-button";
// import { StopButton } from "../stop-button";
import { BoardReport } from "../board-report";
import { SmartCropStructType } from "../../../redux/structs/smartcrop";
import { TimeChart } from "../time-chart";
import { CostChart } from "../cost-chart";
import SmartCropView from "./smart-crop-view";

type PropsFromRedux = ConnectedProps<typeof connector>;

const SmartCropLeftPanel = ({ currentView, completedDate, automationName, automationJob: job }: PropsFromRedux) => {
  const [showBanner, toggleBanner] = useState(true);

  // if (!job) return null;
  // const total = job?.job_progress?.total;
  // const processed = job?.job_progress?.processed;
  // const isFinished = (total > 0 && processed === total) || automationStatus === JOB_STATUS.COMPLETED;

  return (
    <div className={styles.Wrapper}>
      <SmartCropView
        currentView={currentView}
        isFinished={true}
        showBanner={showBanner}
        onToggleBanner={toggleBanner}
        completedDate={completedDate}
        automationName={automationName}
      />
      <BoardReport className={styles.Section} />
      <Divider />
      {/* <Row gutter={24}>
          <Col span={12}>
            <PauseButton jobStatus={job?.automation_job_status?.status} />
          </Col>
          <Col span={12}>
            <StopButton jobStatus={job?.automation_job_status?.status} />
          </Col>
        </Row> */}
      <TimeChart automationTime={job.automationTime} humanTime={job.humanTime} />
      <CostChart className={styles.Section} automationCost={job.automationCost} humanCost={job.humanCost} />
    </div>
  );
};

const mapStateToProps = (state: { smartcrop: SmartCropStructType }) => ({
  processed: state.smartcrop.processed,
  total: state.smartcrop.total,
  currentView: state.smartcrop.currentView,
  completedDate: state.smartcrop.completedDate,
  latestJobId: state.smartcrop.latestJobId,
  automationJob: state.smartcrop.automationJob,
  automationStatus: state.smartcrop.smartCropStatus,
  automationName: state.smartcrop.automationName
});
const connector = connect(mapStateToProps);
export default connector(SmartCropLeftPanel);

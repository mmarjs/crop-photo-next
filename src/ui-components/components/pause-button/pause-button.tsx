import React from "react";
import { connect, ConnectedProps } from "react-redux";
import { Dispatch } from "redux";

import { SmartCropStructType } from "../../../redux/structs/smartcrop";
import { pauseAssetProcessing, resumeAssetProcessing } from "../../../redux/actions/smartcropActions";
import styles from "./pause-button.module.scss";
import IconPause from "../../assets/icons/icon-pause.svg";
import IconPlay from "../../assets/icons/icon-play.svg";
import { Button } from "../button";
import { JOB_ACTIONS, JOB_STATUS } from "../../../common/Enums";
import API from "../../../util/web/api";
import { Logger } from "aws-amplify";
import { useTranslation } from "react-i18next";

type PropsFromRedux = ConnectedProps<typeof connector>;
interface PauseButtonProps extends PropsFromRedux {
  jobStatus: JOB_STATUS;
}

const PauseButton = ({ paused, pauseProcessing, resumeProcessing, jobStatus, latestJobId }: PauseButtonProps) => {
  const logger = new Logger("components:ui-components:pause-button");
  const { t } = useTranslation();

  const togglePauseState = () => {
    if (paused) {
      logger.info("updateJobStatus resume", latestJobId);
      API.updateJobStatus(latestJobId, JOB_ACTIONS.RESUME);
      resumeProcessing();
      return;
    }

    if (!paused && jobStatus === JOB_STATUS.RUNNING) {
      logger.info("updateJobStatus pause", latestJobId);
      API.updateJobStatus(latestJobId, JOB_ACTIONS.PAUSE);
      pauseProcessing();
    }
  };

  return (
    <Button
      className={styles.Wrapper}
      icon={
        <>
          {!paused && <IconPause />}
          {paused && <IconPlay />}
        </>
      }
      type={paused ? "primary" : "default"}
      onClick={togglePauseState}
      label={paused ? `${t("in_progress.left_panel.resume")}` : `${t("in_progress.left_panel.pause")}`}
    />
  );
};

const mapStateToProps = (state: { smartcrop: SmartCropStructType }) => ({
  paused: state.smartcrop.pause,
  latestJobId: state.smartcrop.latestJobId
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  pauseProcessing: () => dispatch(pauseAssetProcessing()),
  resumeProcessing: () => dispatch(resumeAssetProcessing())
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(PauseButton);

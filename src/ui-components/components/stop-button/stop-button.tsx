import React, { useState } from "react";
import { Dispatch } from "redux";

import styles from "./stop-button.module.scss";
import IconStop from "../../assets/icons/icon-stop.svg";
import { CustomModal } from "../modal";
import { SmartCropStructType } from "../../../redux/structs/smartcrop";
import { stopAssetProcessing } from "../../../redux/actions/smartcropActions";
import { connect, ConnectedProps } from "react-redux";
import { Button } from "../button";
import API from "../../../util/web/api";
import { JOB_ACTIONS, JOB_STATUS } from "../../../common/Enums";
import { Logger } from "aws-amplify";
import { useTranslation } from "react-i18next";

type PropsFromRedux = ConnectedProps<typeof connector>;

interface StopButtonProps extends PropsFromRedux {
  jobStatus: string;
}

const StopButton = ({ stop, stopProcessing, jobStatus, latestJobId }: StopButtonProps) => {
  const [stopped, toggleState] = useState(stop);
  const logger = new Logger("ui-components:components:stop-button");
  const { t } = useTranslation();

  const onClickOfStopButton = () => {
    logger.info("onClickOfStopButton", latestJobId, jobStatus);
    if (latestJobId && jobStatus === JOB_STATUS.RUNNING) {
      logger.info("updateJobStatus stop", latestJobId);
      API.updateJobStatus(latestJobId, JOB_ACTIONS.STOP);
      stopProcessing();
    }
    toggleState(false);
  };
  return (
    <>
      <Button
        className={styles.Wrapper}
        icon={<IconStop />}
        onClick={() => toggleState(true)}
        type="default"
        label={t("in_progress.left_panel.stop")}
      />
      <CustomModal
        title={t("in_progress.left_panel.stop_modal.title")}
        okText={t("in_progress.left_panel.stop_modal.ok_text")}
        cancelText={t("in_progress.left_panel.stop_modal.cancel_text")}
        visible={stopped}
        onOk={onClickOfStopButton}
        onCancel={() => toggleState(false)}
        type="danger"
      >
        <p className={styles.StopModalContent}>{t("in_progress.left_panel.stop_modal.desc")}</p>
      </CustomModal>
    </>
  );
};

const mapStateToProps = (state: { smartcrop: SmartCropStructType }) => ({
  stop: state.smartcrop.stop,
  latestJobId: state.smartcrop.latestJobId
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  stopProcessing: () => dispatch(stopAssetProcessing())
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(StopButton);

import React from "react";
import { Progress } from "../progress";
import { connect, ConnectedProps } from "react-redux";
import styles from "./progress-fileloader.module.scss";
import { SmartCropStructType } from "../../../redux/structs/smartcrop";

type PropsFromRedux = ConnectedProps<typeof connector>;

const ProgressFileLoader = ({ pause, stop, automationJob: job }: PropsFromRedux) => {
  // if (job?.job_progress) {
  //   const processed = Number(job.job_progress.processed);
  //   const total = Number(job.job_progress.total);
  //   return (
  //     <div className={styles.Wrapper}>
  //       <h4>
  //         <strong>{processed}</strong> of {total}
  //       </h4>
  //       <Progress
  //         percent={(processed / total) * 100}
  //         strokeColor={stop || pause ? "#FDBE1B" : "#0038FF"}
  //         trailColor={stop || pause ? "#FCF7EB" : "#F0F8FE"}
  //       />
  //     </div>
  //   );
  // }
  return null;
};

const mapStateToProps = (state: { smartcrop: SmartCropStructType }) => ({
  stop: state.smartcrop.stop,
  pause: state.smartcrop.pause,
  processed: state.smartcrop.processed,
  total: state.smartcrop.total,
  automationJob: state.smartcrop.automationJob
});

const connector = connect(mapStateToProps);

export default connector(ProgressFileLoader);

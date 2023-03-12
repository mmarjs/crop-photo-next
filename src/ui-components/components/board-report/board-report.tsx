import React from "react";
import classNames from "classnames";
import { connect, ConnectedProps } from "react-redux";
import { CustomCard } from "../custom-card";
import styles from "./board-report.module.scss";
import { SmartCropStructType } from "../../../redux/structs/smartcrop";
import { JOB_STATUS } from "../../../common/Enums";
import { useTranslation } from "react-i18next";

function intlFormat(num: number) {
  return new Intl.NumberFormat().format(Math.round(num * 10) / 10);
}

export function makeFriendly(num: number) {
  let numStr = num.toString().replace("$", "").replace(",", "").replace(".00", "");
  let newNumber = Number(numStr);
  if (newNumber >= 1000000) return intlFormat(newNumber / 1000000) + "M";
  if (newNumber >= 1000) return intlFormat(newNumber / 1000) + "K";
  return intlFormat(newNumber);
}

const formatTime = (timeInMillisec: number) => {
  const hours = Math.floor(timeInMillisec / 1000 / 60 / 60);
  const minutes = Math.floor((timeInMillisec - hours * 1000 * 60 * 60) / 1000 / 60);
  const seconds = Math.floor((timeInMillisec - hours * 1000 * 60 * 60 - minutes * 1000 * 60) / 1000);
  return `${hours >= 10 ? hours : `0${hours}`}:${minutes >= 10 ? minutes : `0${minutes}`}:${
    seconds >= 10 ? seconds : `0${seconds}`
  }`;
};

// const formatPrice = (amount: number) =>
//   new Intl.NumberFormat("en-US", {
//     style: "currency",
//     currency: "USD",
//     currencyDisplay: "narrowSymbol",
//     minimumFractionDigits: 2
//   }).format(amount);

type PropsFromRedux = ConnectedProps<typeof connector>;

interface BoardReportProps extends PropsFromRedux {
  className: string;
}

const BoardReport = ({ processed, total, className, automationJob: job }: BoardReportProps) => {
  const { t } = useTranslation();
  if (!job?.hasAutomationDetails) return null;
  // const { job_explore, automation_job_status: jobStatus } = job;
  const isFinished = total > 0 && processed === total;
  return (
    <div
      className={classNames(styles.Wrapper, className, styles.Finished, {
        // [styles.InProgress]: !isFinished,
        // [styles.Finished]: isFinished
      })}
    >
      <CustomCard
        className={styles.ElapsedTime}
        title={t("in_progress.left_panel.board_report.elapsed_time")}
        content={`${job.elapsedTime ? formatTime(job.elapsedTime * 1000) : "00:00:07:94"}`}
        footer={
          !isFinished
            ? `${job.elapsedTimePerAsset}ms ${t("in_progress.left_panel.board_report.per_image")}`
            : `${t("in_progress.left_panel.board_report.average_of")} ${job.elapsedTimePerAsset}ms ${t(
                "in_progress.left_panel.board_report.per_image"
              )}`
        }
        bgColor="#EFF1F3"
      />
      {/* {!isFinished && (
        <CustomCard
          className={styles.ETA}
          title={t("in_progress.left_panel.board_report.eta")}
          content={`${
            job_explore.job_time_details.approx_eta ? formatTime(job_explore.job_time_details.approx_eta) : "00:00:00"
          }`}
          footer={t("in_progress.left_panel.board_report.approx")}
          bgColor="#EFF1F3"
        />
      )} */}
      <CustomCard
        className={styles.Cost}
        title={t("in_progress.left_panel.board_report.cost")}
        content={`$0`}
        footer={`$0 ${t("in_progress.left_panel.board_report.per_image")}`}
        bgColor="#F0F8FE"
      />
      {/* {!isFinished && (
        <CustomCard
          className={styles.CostEstimate}
          title={t("in_progress.left_panel.board_report.cost_estimate")}
          content={`${
            job_explore?.job_cost_details?.cost_estimate ? makeFriendly(job_explore.job_cost_details.cost_estimate) : 0
          }`}
          bgColor="#F0F8FE"
        />
      )} */}
      {/* {isFinished && (
        <CustomCard
          className={styles.Saved}
          title={t("in_progress.left_panel.board_report.saved")}
          content={`${
            job_explore.job_cost_details.cost_saved ? makeFriendly(job_explore.job_cost_details.cost_saved) : 0
          }`}
          footer={`${job_explore.job_cost_details.cost_per_asset} ${t(
            "in_progress.left_panel.board_report.per_image"
          )}`}
          bgColor="#E8FBEF"
        />
      )} */}
      {/* <CustomCard
        className={styles.CostEstimate}
        title={t("in_progress.left_panel.board_report.cost_estimate")}
        content={`${
          job_explore?.job_cost_details?.cost_estimate ? makeFriendly(job_explore.job_cost_details.cost_estimate) : 0
        }`}
        bgColor="#F0F8FE"
      /> */}
      <CustomCard
        className={styles.Saved}
        title={t("in_progress.left_panel.board_report.saved")}
        content={`$${job.costSaved ? makeFriendly(job.costSaved) : 0}`}
        footer={`$0.0 ${t("in_progress.left_panel.board_report.per_image")}`}
        bgColor="#E8FBEF"
      />
    </div>
  );
};

const mapStateToProps = (state: { smartcrop: SmartCropStructType }) => ({
  processed: state.smartcrop.processed,
  total: state.smartcrop.total,
  automationJob: state.smartcrop.automationJob
});

const connector = connect(mapStateToProps);
export default connector(BoardReport);

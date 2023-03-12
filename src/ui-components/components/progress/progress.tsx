import { Progress as AntProgress } from "antd";
import classNames from "classnames";
import { ComponentProp } from "../../../common/Types";
import styles from "./progress.module.scss";

export type ProgressProps = ComponentProp & {
  percent: number;
  strokeColor?: string;
  trailColor?: string;
};

const Progress = ({ percent, strokeColor, trailColor, className }: ProgressProps) => (
  <AntProgress
    className={classNames(styles.Wrapper, className)}
    percent={percent}
    showInfo={false}
    strokeColor={strokeColor ?? "#0038FF"}
    trailColor={trailColor ?? "#D9DDE1"}
    status="active"
  />
);

export default Progress;

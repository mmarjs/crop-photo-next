import { Steps as AntSteps } from "antd";
import classNames from "classnames";
import { Direction } from "../../../common/Enums";
import styles from "./steps.module.scss";
import IconCheck from "../../assets/icons/icon-check-circle.svg";

const { Step } = AntSteps;

type StepsProps = {
  labels: string[];
  currentStep: number;
  direction?: Direction;
};

const customDot = (_: any, { status }: any) => {
  return (
    <span
      className={classNames(styles.CustomDot, {
        [styles.Finished]: status === "finish",
        [styles.Process]: status === "process"
      })}
    >
      {status === "finish" && <IconCheck />}
    </span>
  );
};

const Steps = ({ labels, currentStep, direction = Direction.HORIZONTAL }: StepsProps) => (
  <AntSteps size="small" current={currentStep} direction={direction} className={styles.Wrapper} progressDot={customDot}>
    {labels.map((label, idx) => (
      <Step title={label} key={idx} />
    ))}
  </AntSteps>
);

export default Steps;

import classNames from "classnames";
import { Dispatch as ReduxDispatch } from "redux";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../button";
import AutoSaveIcon from "/public/images/cloudWithArrow.svg";
import { connect, ConnectedProps } from "react-redux";
import { SmartCropStructType } from "../../../redux/structs/smartcrop";
import { updateJobId, updateSmartCropStatus } from "../../../redux/actions/smartcropActions";
import styles from "./stepper.module.scss";
import { useRouter } from "next/router";
import { useSelectedSize, useTotalAssetCount } from "../../smart-crop-components/jotai";
import { useAutomationType } from "../../smart-crop-components/jotai/atomQueries";
import { AutomationType } from "../../enums/AutomationType";

interface StepperProps {
  stepNames: string[];
  currentStep: number;
  onSubmitJobConfig: () => void;
  loading: boolean;
  showStepperButtons: boolean;
  onNextStep: () => void;
  automationName: string;
}

const Stepper = ({
  stepNames,
  currentStep,
  onSubmitJobConfig,
  loading,
  showStepperButtons,
  onNextStep,
  automationName
}: StepperProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { automationId, editing, status, step } = router?.query;
  const [total] = useTotalAssetCount();
  const pathname = router?.pathname;
  const [selectedSizes] = useSelectedSize();
  const [automationType] = useAutomationType();

  const onNext = () => {
    onNextStep();
  };

  const onBack = useCallback(() => {
    const prevStep = currentStep - 1;
    router.push(
      `${pathname}?automationId=${automationId}&editing=${Boolean(editing)}&step=${prevStep}&status=${status}`
    );
  }, [currentStep, router, pathname, automationId, editing, status]);

  const disableNextBtn = useMemo(() => {
    if (automationType === AutomationType.UNRECOGNIZABLE_CROP) {
      return automationName.trim().length < 3 || (selectedSizes?.length === 0 && step === "2");
    }

    if (automationType === AutomationType.REMOVE_BG_RESIZE) {
      return automationName.trim().length < 3 || (selectedSizes?.length === 0 && step === "1");
    }

    if (automationType === AutomationType.SMART_CROP) {
      return automationName.trim().length < 3 || (selectedSizes?.length === 0 && step === "3");
    }

    return false;
  }, [automationName, automationType, selectedSizes, step]);

  return (
    <>
      <div className={styles.stepperWrapper}>
        <div className={styles.stepperHeading}>
          <div className={styles.stepName}>{stepNames[currentStep]}</div>
          <div className={styles.currentStep}>{`${
            currentStep + 1 > stepNames.length ? stepNames.length : currentStep + 1
          }/${stepNames.length}`}</div>
        </div>
        <div className={styles.stepPills}>
          {stepNames.map((stepName, i) => (
            <div
              className={classNames(styles.pill, {
                [styles.pillComplete]: i < currentStep,
                [styles.pillActive]: i === currentStep
              })}
              key={i}
            />
          ))}
        </div>
        <div className={styles.autoSaveText}>
          <span>
            <AutoSaveIcon />
          </span>
          <span>
            {loading ? t("configuration.left_panel.autosave_in_progress") : t("configuration.left_panel.autosaveText")}
          </span>
        </div>

        {showStepperButtons ? (
          <div className={styles.nextPrevButtons}>
            <Button className={styles.btn} type="default" label="Back" disabled={currentStep === 0} onClick={onBack} />
            {currentStep + 1 !== stepNames.length ? (
              <Button
                className={styles.btn}
                type="primary"
                label="Next"
                disabled={disableNextBtn || loading}
                onClick={onNext}
                loading={loading}
              />
            ) : (
              <Button
                className={styles.btn}
                type="primary"
                label="Start Crop"
                disabled={total === 0 || loading}
                loading={loading}
                onClick={onSubmitJobConfig}
              />
            )}
          </div>
        ) : null}
      </div>
    </>
  );
};

export default Stepper;

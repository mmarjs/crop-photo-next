import styles from "../../../styles/PlanContainer.module.css";
import { Button } from "../button/index";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { PlanNames } from "../../enums/PlanDuration";

interface SelectPlanActionGroupProps {
  isExpired: boolean;
  isUserHasPlan: boolean;
  isToDowngrade: boolean;
  planName: string;
  isCurrentPlan: boolean;
  onSelectPlan: () => void;
  onLearnMoreClick: () => void;
  isUpcomingPlan: boolean;
}

const SelectPlanActionGroup = ({
  isExpired,
  onLearnMoreClick,
  isUserHasPlan,
  isToDowngrade,
  planName,
  isCurrentPlan,
  onSelectPlan,
  isUpcomingPlan
}: SelectPlanActionGroupProps) => {
  const { t } = useTranslation();

  const mainButton = useMemo(() => {
    // expired plan
    // if (isExpired || (!isUserHasPlan && planName === PlanNames.FREE)) {
    //     //   return (
    //     //     <Button
    //     //       danger
    //     //       type="primary"
    //     //       className={styles.expiredPlanButton}
    //     //       label={t("billing.expired")}
    //     //       labelClassName={styles.expiredPlan}
    //     //       disabled
    //     //     />
    //     //   );
    //     // }
    //current plan
    if (!isExpired && isCurrentPlan && isUserHasPlan) {
      return (
        <Button
          type="primary"
          className={styles.planCurrent}
          label={t("billing.cancel_plan_text")}
          onClick={onSelectPlan}
        />
      );
    }

    if (!isExpired && isUpcomingPlan && isUserHasPlan) {
      return (
        <Button
          danger
          type="primary"
          className={styles.upcomingPlanButton}
          label={t("billing.upgrade_cancel")}
          onClick={onSelectPlan}
        />
      );
    }

    return (
      <Button
        type="primary"
        label={
          isToDowngrade
            ? t("billing.plan_container.downgrade", { planName })
            : t("billing.plan_container.upgrade", { planName })
        }
        className={classNames(isToDowngrade ? styles.downgradeType : styles.planStatus)}
        labelClassName={isToDowngrade ? styles.downgradeTypeLabel : ""}
        onClick={onSelectPlan}
      />
    );
  }, [isExpired, isUserHasPlan, planName, isCurrentPlan, isUpcomingPlan, isToDowngrade, t, onSelectPlan]);

  return (
    <div>
      {mainButton}
      <div className={styles.learnMore}>
        <span className={classNames(styles.learnMoreLabel, "bot-launch-plans-information")} onClick={onLearnMoreClick}>
          {t("billing.learn_more")}
        </span>
      </div>
    </div>
  );
};

export default SelectPlanActionGroup;

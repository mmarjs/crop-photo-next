import React from "react";
import { useTranslation } from "react-i18next";
import styles from "../../../styles/PlanContainer.module.css";

export type DowngradeContainerProps = {
  planName: string;
};

export const CancelUpcomingPlanContent = ({ planName }: DowngradeContainerProps) => {
  const { t } = useTranslation();

  return (
    <div>
      <p className={styles.topMsg}>{t("billing.cancel_upcoming_plan.desc")}</p>
    </div>
  );
};

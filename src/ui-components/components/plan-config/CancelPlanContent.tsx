import React from "react";
import { useTranslation } from "react-i18next";
import styles from "../../../styles/PlanContainer.module.css";

export type CancelPlanContentProps = {
  planName: string;
};

export const CancelPlanContent = ({ planName }: CancelPlanContentProps) => {
  const { t } = useTranslation();

  return (
    <div>
      <p className={styles.topMsg}>{t("billing.cancel_plan.desc")}</p>
    </div>
  );
};

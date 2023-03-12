import styles from "../../../styles/PlanContainer.module.css";
import { Select } from "antd";
import { useTranslation } from "react-i18next";
import date from "../../utils/date";

export type DowngradeContainerProps = {
  userPlanName: string;
  planName: string;
  onReasonChange: (reason: string) => void;
  userPlanEndDate: any;
};

export const DowngradeContainer = ({
  userPlanName,
  planName,
  onReasonChange,
  userPlanEndDate
}: DowngradeContainerProps) => {
  const { t } = useTranslation();

  let dropdownItems = [
    {
      id: "downgrade-reason-1",
      label: t("billing.downgrade.reasons.reason_one")
    },
    {
      id: "downgrade-reason-2",
      label: t("billing.downgrade.reasons.reason_two")
    },
    {
      id: "downgrade-reason-3",
      label: t("billing.downgrade.reasons.reason_three")
    },
    {
      id: "downgrade-reason-4",
      label: t("billing.downgrade.reasons.reason_four")
    }
  ];

  const onReasonSelect = (reason: string) => {
    const r = dropdownItems.find(item => item.id === reason);
    onReasonChange(r?.label as string);
  };

  return (
    <div>
      <p className={styles.topMsg}>{t("billing.downgrade.desc", { currentPlan: userPlanName, newPlan: planName })}</p>
      <div className={styles.reasonHeader}>
        {t("billing.downgrade.reason")}
        <div className={styles.asterix}>*</div>
      </div>
      <Select
        style={{ width: 552 }}
        placeholder={t("billing.downgrade.select_label")}
        className={styles.dropdownClassName}
        onChange={onReasonSelect}
      >
        {dropdownItems.map((value, key) => {
          return (
            <Select.Option key={key} value={value.id}>
              {value.label}
            </Select.Option>
          );
        })}
      </Select>
      <p className={styles.bottomMsg}>
        {`${t("billing.downgrade.end_date", {
          currentPlan: userPlanName
        })} ${date(userPlanEndDate).format("dddd")}, ${date(userPlanEndDate).format("LL")}.`}
      </p>
    </div>
  );
};

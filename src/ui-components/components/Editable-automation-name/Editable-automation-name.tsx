import { Button } from "antd";
import { debounce, isEmpty } from "lodash";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ARTICLE_URL_ID, AUTOMATION_STATUS } from "../../../common/Enums";
import { useGetAutomationStatus } from "../../smart-crop-components/jotai/atomQueries";
import { Input } from "../input";
import LearnMore from "../LearnMore";
import styles from "./Editable-automation-name.module.scss";

interface EditableAutomationNameProps {
  placeholder: string;
  automationName: string;
  onAutomationNameChange: (name: string) => void;
}

const EditableAutomationName = ({
  placeholder,
  automationName,
  onAutomationNameChange
}: EditableAutomationNameProps) => {
  const { t } = useTranslation();
  const { automationId } = useRouter()?.query;
  const { data: automation, isLoading } = useGetAutomationStatus(automationId as string);
  const automationStatus = automation?.getAutomationStatus();

  const onNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    onAutomationNameChange(e.target.value);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.heading}>{t("editable_automation_name.heading")}</div>
      <div className={styles.subHeading}>
        {t("editable_automation_name.subHeading")}
        <span>
          <LearnMore article={ARTICLE_URL_ID.PROJECT_NAME as string} />
        </span>
      </div>
      <Input
        title={automationName}
        customizeClassName={styles.input}
        placeholder={placeholder}
        onChange={onNameChange}
        text={automationName}
        debounce={100}
        disabled={
          isLoading ||
          automationStatus === AUTOMATION_STATUS.COMPLETED ||
          automationStatus === AUTOMATION_STATUS.RUNNING
        }
      />
      {automationName?.length < 3 && (
        <p className={styles.errorText}>{t("configuration.errors.automation_name_len")}</p>
      )}
      <div className={styles.horizontalLine}></div>
    </div>
  );
};

export default EditableAutomationName;

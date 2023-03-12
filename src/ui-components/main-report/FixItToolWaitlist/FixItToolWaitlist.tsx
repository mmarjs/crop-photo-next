import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useIntercom } from "react-use-intercom";
import useDebounce from "../../../hooks/useDebounce";
import { useIsEmailValid } from "../../../hooks/useIsEmailValid";
import { Button } from "../../components/button";
import { InputWithButton } from "../../components/input/input";
import styles from "./FixItToolWaitlist.module.scss";

export enum EmailState {
  INVALID = "INVALID",
  EMPTY = "EMPTY"
}

export default function FixItToolWaitlist() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const debouncedEmail = useDebounce(email, 500);
  const { trackEvent } = useIntercom();
  const [isSending, setIsSending] = useState(false);

  const isEmailValid = useIsEmailValid(debouncedEmail);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  const handleSubmit = () => {
    setIsSending(true);
    setTimeout(() => {
      trackEvent("join_waitlist", {
        email_address: debouncedEmail
      });
      setIsSending(false);
      setEmail("");
    }, 1500);
  };

  const errorMessage = t("main_report.errors.invalid_email");
  return (
    <div className={styles.FixItToolWaitlist}>
      <div>
        <h2 className={styles.fixItToolHeading}>
          {t("main_report.fix_it_tool.title")}{" "}
          <span className={styles.gradientBlueText}>{t("main_report.fix_it_tool.waitlist")}</span>
        </h2>
        <p className={styles.fixItToolDesc}>{t("main_report.fix_it_tool.desc")}</p>
        <div className={styles.fixItToolInput}>
          <InputWithButton
            inputProps={{
              placeholder: t("main_report.fix_it_tool.placeholder"),
              onChange: handleEmailChange,
              value: email,
              type: "email"
            }}
            buttonProps={{
              label: t("main_report.fix_it_tool.join_waitlist"),
              disabled: !email,
              onClick: handleSubmit,
              loading: isSending
            }}
            errorMessage={!!debouncedEmail && !isEmailValid ? errorMessage : undefined}
          />
        </div>
      </div>
      <div className={styles.fixItPreview}>
        <div className={styles.fixItPreviewInner}>
          <img src="/images/wand.svg" alt="wand" className={styles.fixItWand} />
          {/* <img src="/images/fixit-sample.png" alt="sample" className={styles.fixItPreviewImage} /> */}
          <img src="/images/preview.svg" alt="preview-handle" className={styles.previewHandle} />
          <button className={styles.fixItPreviewButton}>
            <img src="/images/crop.photo.svg" alt="crop.photo" width={12} />
            <span>{t("main_report.fix_it_tool.after_fix")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

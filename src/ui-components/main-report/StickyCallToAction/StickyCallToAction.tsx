import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useIntercom } from "react-use-intercom";
import useDebounce from "../../../hooks/useDebounce";
import { useIsEmailValid } from "../../../hooks/useIsEmailValid";
import { InputWithButton } from "../../components/input/input";
import styles from "./StickyCallToAction.module.scss";

export default function StickyCallToAction() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const debouncedEmail = useDebounce(email, 500);
  const isEmailValid = useIsEmailValid(debouncedEmail);
  const [isSending, setIsSending] = useState(false);
  const { trackEvent } = useIntercom();

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
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const errorMessage = t("main_report.errors.invalid_email");
  return (
    <div className={styles.StickyCallToAction}>
      <div className={styles.gradientBackground}>
        <h3 className={styles.stickyTitle}>
          <span>Join</span> <span className={styles.gradientText}>Fix It Tool</span>
        </h3>
        <div className={styles.emailInputContainer}>
          <img src="/images/curve_left_arrow.svg" />
          <InputWithButton
            buttonProps={{
              label: "Join Waitlist",
              disabled: !email,
              onClick: handleSubmit,
              loading: false
            }}
            inputProps={{
              placeholder: "Write your email here...",
              value: email,
              onChange: handleEmailChange,
              type: "email"
            }}
            errorMessage={!!debouncedEmail && !isEmailValid ? errorMessage : undefined}
          />
          <img src="/images/curve_right_arrow.svg" />
        </div>
        <p className={styles.desc}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. <br />
          Duis bibendum justo purus, non quam commodo id.
        </p>
      </div>
    </div>
  );
}

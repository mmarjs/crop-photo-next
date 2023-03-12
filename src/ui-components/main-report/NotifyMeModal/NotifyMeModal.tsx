import Modal from "antd/lib/modal/Modal";
import Grid from "antd/lib/grid";
import styles from "./NotifyMeModal.module.scss";
import { InputWithButton } from "../../components/input/input";
import { useState } from "react";
import { useIntercom } from "react-use-intercom";
import useDebounce from "../../../hooks/useDebounce";
import { useIsEmailValid } from "../../../hooks/useIsEmailValid";
import { useTranslation } from "react-i18next";

const { useBreakpoint } = Grid;

interface NotifyMeModalProps {
  show: boolean;
  onClose: () => void;
  onOk: () => void;
  marketplace: string;
}
export default function NotifyMeModal({ show, onClose, onOk, marketplace }: NotifyMeModalProps) {
  const screens = useBreakpoint();
  const [isSending, setIsSending] = useState(false);
  const { trackEvent } = useIntercom();
  const [email, setEmail] = useState("");
  const debouncedEmail = useDebounce(email, 200);
  const { t } = useTranslation();
  const isEmailValid = useIsEmailValid(debouncedEmail);

  const handleSubmit = () => {
    if (!isEmailValid) return;
    setIsSending(true);
    setTimeout(() => {
      trackEvent("notify_me", {
        email_address: debouncedEmail,
        marketplace
      });
      setIsSending(false);
      setEmail("");
      onClose();
    }, 1500);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  return (
    <Modal
      title={"Title"}
      open={show}
      onOk={onOk}
      onCancel={onClose}
      footer={null}
      className={styles.NotifyMe}
      wrapClassName={styles.NotifyMeWrapper}
      width={screens.xs ? 360 : 600}
      bodyStyle={{
        borderRadius: 16
      }}
      style={{
        borderRadius: 16
      }}
      destroyOnClose
      closeIcon={<img src="/images/close-black.svg" width="10" />}
    >
      <h2>{t("main_report.notify_me.title")}</h2>
      <p>
        {t("main_report.notify_me.desc", {
          marketplace
        })}
      </p>
      <InputWithButton
        buttonProps={{
          label: "Notify Me",
          disabled: !isEmailValid || !email,
          onClick: handleSubmit,
          loading: isSending
        }}
        inputProps={{
          placeholder: "john@doe.com",
          value: email,
          onChange: handleEmailChange,
          onPressEnter: handleSubmit
        }}
        defaultBorder
      />
    </Modal>
  );
}

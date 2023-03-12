import { Button, PrimaryButton } from "../button"; //'@evolphin/library.components.button';
import { VLayout } from "../vLayout"; //'@evolphin/library.components.v-layout';
import React, { ChangeEvent, MouseEvent, MouseEventHandler, useEffect, useState } from "react";
import { InputWithOuterLabel } from "../input"; //'@evolphin/library.components.composite.input-with-label';
import { VerifyCode } from "../verify-code";
import { Header } from "../header";

import styles from "./reset-password.module.scss";
import { HLayout } from "../hLayout";
import { Label } from "../label";
import { LOGIN_PAGE, redirectToPath } from "../../../lib/navigation/routes";
import { useRouter } from "next/router";
import useDebounce from "../../../hooks/useDebounce";
import isEmpty from "lodash/isEmpty";
import { useTranslation } from "react-i18next";

/**
 *
 */
export type ResetPasswordProps = {
  /**
   * a class name style to be rendered in the component.
   */
  className?: string;

  /**
   *
   */
  enableResetPasswordButton?: boolean;

  /**
   *
   */
  onPasswordChange?: Function;

  /**
   *
   */
  onNextClick: Function;

  /**
   *
   */
  onResetPassword: Function;

  /**
   *
   */
  onResendCode?: (
    event: React.MouseEventHandler<HTMLParagraphElement> | undefined,
    onSuccess: Function,
    onError: Function
  ) => void;

  /**
   * Reset password status
   */
  isResettingPassword: boolean;
};

/**
 *
 * @param param0
 * @returns
 */
export function ResetPassword({
  enableResetPasswordButton,
  onPasswordChange,
  onNextClick,
  onResetPassword,
  onResendCode,
  isResettingPassword
}: ResetPasswordProps) {
  const [isPasswordValidated, setIsPasswordValidated] = useState(false);
  const [showVerifyCode, setShowVerifyCode] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSendingCode, setSendingCode] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const router = useRouter();
  const debouncedConfirmPassword = useDebounce(confirmPassword, 250);
  const { t } = useTranslation();

  useEffect(() => {
    if (debouncedConfirmPassword === password) {
      setError("");
      setIsPasswordValidated(true);
    } else {
      setError(t("forgot_password.errors.not_match"));
      setIsPasswordValidated(false);
    }
  }, [debouncedConfirmPassword, password]);

  /**
   *
   * @param e
   * @param onPasswordChange
   */
  function onChangeOfNewPassword(e: ChangeEvent<HTMLInputElement>) {
    setPassword(e.currentTarget.value);
    onPasswordChange ? onPasswordChange(e.currentTarget.value) : void 0;
  }

  /**
   *
   * @param e
   */
  function onChangeOfConfirmPassword(e: ChangeEvent<HTMLTextAreaElement>) {
    setConfirmPassword(e.target.value);
  }

  /**
   *
   */
  const onNextHandler = async () => {
    if (isSendingCode) return;
    setSendingCode(true);
    await onNextClick();
    setSendingCode(false);

    setShowVerifyCode(true);
  };

  function onBackToSignInClick() {
    redirectToPath(LOGIN_PAGE, router, window);
  }

  return (
    <VLayout noMargin={true} gap={36}>
      <InputWithOuterLabel
        labelText={t("forgot_password.placeholders.new_password")}
        type="password"
        placeholder="**********"
        onChange={onChangeOfNewPassword}
        validation
        debounce={250}
      />
      <div className={styles.ConfirmPasswordContainer}>
        <InputWithOuterLabel
          labelText={t("forgot_password.placeholders.confirm_password")}
          type="password"
          placeholder="**********"
          onChange={onChangeOfConfirmPassword}
        />
        {!isEmpty(error) && debouncedConfirmPassword ? (
          <Label customizeClassName={styles.error} labelText={error} />
        ) : null}
      </div>
      {showVerifyCode && (
        <VLayout noMargin={true} gap={40}>
          <div className={styles.VerifyHeader}>
            <h2>{t("verify_code.title")}</h2>
            <p>{t("verify_code.desc")}</p>
            <VerifyCode
              label={t("verify_code.cta")}
              submitButtonLabel={t("verify_code.submit")}
              showResendCode={false}
              onSubmitClick={(code: string) => onResetPassword(code, password)}
              isSubmitting={isResettingPassword}
              onBackToSignIn={onBackToSignInClick}
              onResendCodeClick={onResendCode}
            />
          </div>
        </VLayout>
      )}
      {!showVerifyCode && (
        <HLayout noPadding={true} noFlex={true} hAlign="flex-end">
          <PrimaryButton
            label={isSendingCode ? t("verify_code.sending") : t("verify_code.next")}
            disabled={!isPasswordValidated || !enableResetPasswordButton}
            onClick={onNextHandler}
            loading={isSendingCode}
          />
        </HLayout>
      )}
    </VLayout>
  );
}

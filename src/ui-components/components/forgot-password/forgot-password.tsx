import { VLayout } from "../vLayout"; //'@evolphin/library.components.v-layout';
import React, { ChangeEvent, MouseEventHandler } from "react";
import { HLayout } from "../hLayout"; //'@evolphin/library.components.h-layout';
import { Button, PrimaryButton } from "../button"; //'@evolphin/library.components.button';

import { InputWithOuterLabel } from "../input";
import styles from "./forgot-password.module.scss";
import { FormEvent } from "react";
import { useTranslation } from "react-i18next";

/**
 *
 */
export type ForgotPasswordProps = {
  className?: string;
  emailId?: string;
  enableResetPwdButton?: boolean;
  onBackToSignIn?: (e: React.MouseEvent<HTMLElement>) => void;
  onResetPassword?: () => void;
  onChangeOfEmail?: Function;
};

/**
 *
 * @param param0
 * @returns
 */
export function ForgotPassword({
  emailId,
  enableResetPwdButton,
  onBackToSignIn,
  onResetPassword,
  onChangeOfEmail
}: ForgotPasswordProps) {
  const { t } = useTranslation();
  const onEmailChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newEmail = e.target.value;
    !!onChangeOfEmail && onChangeOfEmail(newEmail);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onResetPassword) onResetPassword();
  };

  return (
    <form onSubmit={onSubmit}>
      <VLayout noMargin={true} gap={8}>
        <InputWithOuterLabel
          customizeClassName={styles.CustomInput}
          name="forgottenEmail"
          text={emailId}
          type="email"
          labelText={t("forgot_password.email.label")}
          placeholder="john@doe.com"
          onChange={onEmailChange}
          validation
          debounce={250}
        />
        <HLayout noPadding={true} noFlex={true} hAlign="space-between">
          <Button label={t("forgot_password.back_to_signin")} onClick={onBackToSignIn} htmlType="button" />
          <PrimaryButton
            label={t("forgot_password.reset_password")}
            disabled={!enableResetPwdButton}
            htmlType="submit"
          />
        </HLayout>
      </VLayout>
    </form>
  );
}

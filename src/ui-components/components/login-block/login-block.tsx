import React, { ChangeEventHandler, MouseEventHandler, useEffect, useRef } from "react";
import { Input as AntInput } from "antd";
import { Button, PrimaryButton } from "../button"; //'@evolphin/library.components.button';
import { InputWithOuterLabel, InputWithOuterLabelAndLink } from "../input"; //'@evolphin/library.components.input';

import { VLayout } from "../vLayout";
import { HLayout } from "../hLayout";
import { useTranslation } from "react-i18next";
import styles from "./login-block.module.scss";

/**
 *
 */
export type LoginBlockProps = {
  /**
   * pre rendered username
   */
  userName?: string;

  /**
   * pre rendered password
   */
  password?: string;

  /**
   * label for username field.
   */
  userNameLbl?: string;

  /**
   * label for password field.
   */
  passwordLbl?: string;

  /**
   * label for create account button.
   */
  createAccountBtnLbl?: string;

  /**
   * label for sign in button.
   */
  signInBtnLbl?: string;

  /**
   *
   */
  signingInBtnLbl?: string;

  /**
   *
   */
  enableSignInButton?: boolean;

  /**
   * on signing in account button handler
   */
  onSignIn: Function;
  /**
   * on forgot password aount button handler
   */
  onForgotPassword?: MouseEventHandler<HTMLElement>;

  /**
   * on creating new account button handler
   */
  onCreateAccount?: React.MouseEventHandler<HTMLElement>;

  /**
   * on username change handler
   */
  onUsernameChange?: ChangeEventHandler<HTMLElement>;

  /**
   * on password change handler
   */
  onPasswordChange?: ChangeEventHandler<HTMLElement>;

  /**
   * Submitting status
   */
  isSubmitting: boolean;
};

/**
 *
 * @param param0
 * @returns
 */
const LoginBlock = ({
  userName,
  password,
  userNameLbl = "Email",
  passwordLbl = "Password",
  createAccountBtnLbl = "Create an account",
  signInBtnLbl = "Sign in",
  signingInBtnLbl = "Signing in",
  enableSignInButton,
  onSignIn,
  onForgotPassword,
  onCreateAccount,
  onUsernameChange,
  onPasswordChange,
  isSubmitting
}: LoginBlockProps) => {
  const usernameRef = useRef<any>(null);
  const { t } = useTranslation();

  useEffect(() => {
    usernameRef.current?.focus();
  }, [usernameRef]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSignIn();
  };

  return (
    <form onSubmit={onSubmit}>
      <VLayout noMargin={true} gap={24}>
        <InputWithOuterLabel
          mandatory={true}
          ref={usernameRef}
          name="username"
          text={userName}
          type="email"
          labelText={userNameLbl}
          placeholder="john@doe.com"
          onChange={onUsernameChange}
          tabIndex={1}
          validation
          debounce={250}
        />
        <InputWithOuterLabelAndLink
          mandatory={true}
          name="password"
          text={password}
          type="password"
          labelText={passwordLbl}
          placeholder="**********"
          onChange={onPasswordChange}
          linkText={t("login.forgot_password_link")}
          onClickOfLink={onForgotPassword}
          tabIndex={2}
        />
        {/* <div className={styles.googleRecaptchaDesc}>
          <p>This site is protected by reCAPTCHA and the Google</p>
          <a href="https://policies.google.com/privacy">Privacy Policy</a> and
          <a href="https://policies.google.com/terms"> Terms of Service</a> apply.
        </div> */}
        <HLayout hAlign="space-between" noPadding={true} noFlex={true}>
          <Button label={createAccountBtnLbl} htmlType="button" onClick={onCreateAccount} />
          <PrimaryButton
            tabIndex={3}
            label={isSubmitting ? signingInBtnLbl : signInBtnLbl}
            // disabled={!enableSignInButton}
            htmlType="submit"
            loading={isSubmitting}
          />
        </HLayout>
      </VLayout>
    </form>
  );
};

export default LoginBlock;

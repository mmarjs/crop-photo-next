import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { LOGIN_PAGE, redirectToPath, getQueryParam, redirectToApplication } from "../../../lib/navigation/routes";
import { useAuth } from "../../../hooks/useAuth";
import { CognitoUser, CognitoUserSession } from "amazon-cognito-identity-js";

import { ResetPassword } from "../../../ui-components/components/reset-password";

import styles from "../../../styles/Reset-Password.module.css";
import AuthenticationController from "../../../controller/AuthenticationController";
import { Label } from "../../../ui-components/components/label";

import { AuthWrapper } from "../../../ui-components/components/auth-wrapper";
import { Logger } from "aws-amplify";
import { toast } from "../../../ui-components/components/toast";
import { t } from "i18next";
import Optional from "../../../util/Optional";
import { UserDetails } from "../../../context/IAuthContext";

const logger = new Logger("pages:user:reset-password:ResetPasswordPage");
export default function ResetPasswordPage() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [validPassword, setValidPassword] = useState(false);
  const [error, setError] = useState("");
  const [isResettingPW, setResettingPW] = useState(false);

  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    let userId: string | string[] | null = getQueryParam("userId");
    if (userId && typeof userId === "string") setUserId(userId);
    user().then((value: Optional<UserDetails>) => {
      if (value.isPresent()) {
        redirectToApplication(router);
      }
    });
    // eslint-disable-next-line
  }, []);

  /**
   *
   * @param newPassword
   * @returns
   */
  function onPasswordChange(newPassword: string) {
    try {
      setValidPassword(AuthenticationController.isValidPassword(newPassword));
      setError("");
    } catch (err: any) {
      setValidPassword(false);
      setError(err && err.message ? err.message : err.toString());
    }

    setPassword(newPassword);
  }

  /**
   *
   * @param verificationCode
   * @param password
   */
  async function onResetPasswordClick(verificationCode: string, password: string) {
    if (isResettingPW) return;
    setResettingPW(true);

    try {
      await AuthenticationController.resetPassword(userId, password, verificationCode);
      redirectToPath(LOGIN_PAGE, router, window);
    } catch (err: any) {
      setError(err && err.message ? err.message : err.toString());
      console.log("Error reseting password : ", err);
      toast(err?.message || err.toString(), "error");
    }

    setResettingPW(false);
  }

  /**
   *
   */
  async function sendForgotPasswordCode(event: any, onSuccess?: Function, onError?: Function) {
    try {
      logger.debug("sendForgotPasswordCode", userId);
      await AuthenticationController.forgotPassword(userId);
      !!onSuccess && onSuccess();
    } catch (error: any) {
      logger.debug("sendForgotPasswordCode error", error);
      toast(error?.message || error?.toString(), "error");
      !!onError && onError();
    }
  }

  return (
    <AuthWrapper
      className={styles.CustomWrapper}
      title={t("forgot_password.reset_password")}
      description={t("forgot_password.reset_password_description")}
    >
      <ResetPassword
        enableResetPasswordButton={validPassword}
        onPasswordChange={onPasswordChange}
        onResetPassword={onResetPasswordClick}
        onResendCode={sendForgotPasswordCode}
        onNextClick={sendForgotPasswordCode}
        isResettingPassword={isResettingPW}
      />
      {/* {error && error != "" && <Label customizeClassName={styles.resetPasswordError} labelText={error} />} */}
    </AuthWrapper>
  );
}

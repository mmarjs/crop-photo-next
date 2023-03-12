import React, { useEffect, useState } from "react";
import { redirectToPath, LOGIN_PAGE, redirectToApplication, getQueryParam } from "../../../lib/navigation/routes";
import { useRouter } from "next/router";
import { useAuth } from "../../../hooks/useAuth";
import AuthenticationController from "../../../controller/AuthenticationController";

import { VerifyCode } from "../../../ui-components/components/verify-code";
import { Button as AntdButton } from "antd";

import { AuthWrapper } from "../../../ui-components/components/auth-wrapper";
import { VLayout } from "../../../ui-components/components/vLayout";
import { toast } from "../../../ui-components/components/toast";
import { Logger } from "aws-amplify";
import { useTranslation } from "react-i18next";
import Optional from "../../../util/Optional";
import { UserDetails } from "../../../context/IAuthContext";
import Link from "next/link";

/**
 *
 * @returns
 */

const logger: Logger = new Logger("pages:verify-signup:VerifySignUpPage");
export default function VerifySignUpPage() {
  const { t } = useTranslation();
  const VERIFY_SIGNUP_PAGE_HEADER: string = t("signup.verify.title");
  const BACK_TO_HOME_BTN_LBL: string = t("signup.verify.back_to_daisy");
  const VERIFY_CODE_HEADER_LBL: string = t("signup.verify.enter_code");
  const VERIFY_CODE_BTN_LBL: string = t("signup.verify.verify_code");

  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, updateSubmitting] = useState(false);
  const [isResending, updateResending] = useState(false);

  const { user } = useAuth();
  useEffect(() => {
    logger.debug("Component mount: ", router.pathname);
    let userId: string | string[] | null = getQueryParam("userId");
    if (!userId || typeof userId !== "string") {
      redirectToApplication(router);
    } else {
      if (userId) setUserId(userId);
      user().then((value: Optional<UserDetails>) => {
        if (value.isPresent()) {
          redirectToApplication(router);
        }
      });
    }
    return () => {
      logger.debug("Component unmount: ", router.pathname);
    };
    // eslint-disable-next-line
  }, []);

  /**
   *
   * @param verificationCode
   */
  async function onVerifyCodeSubmit(verificationCode: string): Promise<any> {
    if (isSubmitting) return;
    updateSubmitting(true);

    try {
      await AuthenticationController.verifySignUp(userId, verificationCode);
      toast(t("signup.success"), "success");
      redirectToPath(LOGIN_PAGE, router, window);
    } catch (err: any) {
      logger.error("onVerifyCodeSubmit error", err);
      toast(err?.message ?? err?.toString(), "error");
      setError(err.message ? err.message : err.toString());
      setTimeout(() => {
        setError("");
      }, 10000);
    }

    updateSubmitting(false);
  }

  /**
   *
   * @param e
   */
  function onBackToEvolphinClick(e: React.MouseEvent<HTMLElement>) {
    redirectToPath(LOGIN_PAGE, router, window);
  }

  /**
   *
   * @param event
   */
  async function onResendCodeClick(event: any) {
    if (isResending) return;
    updateResending(true);

    try {
      await AuthenticationController.resendSignUpCode(userId);
    } catch (e: any) {
      logger.error("onResendCodeClick", e);
      if (e?.message) {
        toast(e?.message, "error");
      }
    }

    updateResending(false);
  }

  return (
    <AuthWrapper
      title={VERIFY_SIGNUP_PAGE_HEADER}
      description={t("signup.verify.desc", {
        id: userId
      })}
      verticalMiddle={true}
      page="otp"
    >
      <VLayout noMargin={true} noFlex={true} gap={0}>
        <VerifyCode
          label={VERIFY_CODE_HEADER_LBL}
          submitButtonLabel={VERIFY_CODE_BTN_LBL}
          onSubmitClick={onVerifyCodeSubmit}
          showResendCode={true}
          onResendCodeClick={onResendCodeClick}
          isSubmitting={isSubmitting}
          isResending={isResending}
          autoSubmit={true}
          verifyError={error}
        />
        <div>
          <Link href={LOGIN_PAGE} replace>
            <AntdButton type="link" style={{ padding: "0" }}>
              {BACK_TO_HOME_BTN_LBL}
            </AntdButton>
          </Link>
        </div>
      </VLayout>
      {/* {error && error != "" ? <Label customizeClassName={styles.verifySignupError} labelText={error} /> : null} */}
    </AuthWrapper>
  );
}

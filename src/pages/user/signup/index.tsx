import React, { ChangeEvent, MouseEvent, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../../hooks/useAuth";
import {
  FORGOT_PASSWORD_PAGE,
  LOGIN_PAGE,
  redirectToApplication,
  redirectToPath,
  redirectToPathWithParams,
  SIGNUP_PAGE,
  VERIFY_SIGNUP_PAGE
} from "../../../lib/navigation/routes";
import AuthenticationController from "../../../controller/AuthenticationController";
import { SignupBlock } from "../../../ui-components/components/signup-block";
import { Logger } from "aws-amplify";
import { AuthWrapper } from "../../../ui-components/components/auth-wrapper";
import { toast } from "../../../ui-components/components/toast";
import { useTranslation } from "react-i18next";
import Optional from "../../../util/Optional";
import { UserDetails } from "../../../context/IAuthContext";
import { ISignUpResult } from "amazon-cognito-identity-js";
import { usePricingPlanAtom } from "../../../jotai";
import Script from "next/script";

const logger = new Logger("pages:user:signup");

export default function Signup() {
  const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningUp, setSigningUp] = useState(false);
  const router = useRouter();
  const { plan } = router?.query;
  const { user } = useAuth();
  const [, setPricingPlan] = usePricingPlanAtom();

  useEffect(() => {
    logger.debug("Component mount: ", router.pathname);
    user().then((value: Optional<UserDetails>) => {
      if (!!plan) {
        setPricingPlan(plan as string);
      }
      if (value.isPresent()) {
        redirectToApplication(router);
      }
    });
    return () => {
      logger.debug("Component unmount: ", router.pathname);
    };
    // eslint-disable-next-line
  }, []);

  const { t } = useTranslation();

  const SIGNUP_PAGE_HEADER: string = t("signup.title");
  const SIGNUP_PAGE_SUB_HEADER: string = t("signup.subtitle");
  const SIGNUP_PAGE_EMAIL_LBL: string = t("signup.labels.email");
  const SIGNUP_PAGE_PASSWORD_LBL: string = t("signup.labels.password");
  const SIGNUP_PAGE_FIRSTNAME_LBL: string = t("signup.labels.first_name");
  const SIGNUP_PAGE_LASTNAME_LBL: string = t("signup.labels.last_name");
  const ALREADY_HAVE_ACCOUNT_BTN_LBL: string = t("signup.labels.has_existing_account");
  const CREATE_ACCOUNT_BTN_LBL: string = t("signup.labels.create_account");
  const CREATING_ACCOUNT_LBL: string = t("signup.labels.creating_account");

  function onGotToLogin() {
    redirectToPath(LOGIN_PAGE, router, window);
  }

  /**
   *
   * @param id
   */
  async function onSSOLoginClick(id: string) {
    try {
      logger.debug("onSSOLoginClick", id);
      await AuthenticationController.ssoSignIn(id);
    } catch (err: any) {
      logger.error("onSSOLoginClick error", err);
      let message: string | null = err?.message;
      if (message && message.indexOf("ONLY_WORK_EMAIL_ALLOWED") != -1) {
        message = t("signup.only_work_email_allowed_error");
      }
      toast(message ?? err?.toString(), "error");
    }
  }

  async function onSignUp(): Promise<any> {
    if (isSigningUp) return;
    setSigningUp(true);
    logger.log("onSignUp plan", plan);
    try {
      // @ts-ignore
      grecaptcha.ready(function () {
        // @ts-ignore
        grecaptcha.execute(SITE_KEY).then(async function (token) {
          try {
            console.log("recaptcha token: " + token);
            const result = await AuthenticationController.signUp(email, password, firstName, lastName, token).then(
              handlePostSignupResponse
            );
            logger.debug("onSignup:", result);
          } catch (err: any) {
            logger.error("onSignup error", err);
            let message: string | null = err?.message;
            if (message && message.indexOf("ONLY_WORK_EMAIL_ALLOWED") != -1) {
              message = t("signup.only_work_email_allowed_error");
            }
            toast(message ?? err?.toString(), "warning");
            setSigningUp(false);
          }
        });
      });
    } catch (error) {
      logger.error("onSignup recaptcha error", error);
    }
  }

  async function handlePostSignupResponse(signupResult: ISignUpResult) {
    if (signupResult.userConfirmed) {
      logger.debug("User has been automatically confirmed. We don't need to send the OTP.");
      toast(t("signup.account_created_successfully"), "success");
      await redirectToPath(LOGIN_PAGE, router, window);
    } else {
      logger.debug("Cognito has sent the OTP. Delivery details: ", signupResult.codeDeliveryDetails);
      await redirectToPathWithParams(VERIFY_SIGNUP_PAGE, { userId: email }, router, window);
    }
    if (!!plan) {
      setPricingPlan(plan as string);
    }
    return signupResult;
  }

  /**
   *
   * @param e
   */
  function onFirstNameChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setFirstName(e.currentTarget.value);
  }

  /**
   *
   * @param e
   */
  function onLastNameChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setLastName(e.currentTarget.value);
  }

  /**
   *
   * @param e
   */
  function onEmailChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setEmail(e.currentTarget.value);
  }

  /**
   *
   * @param e
   */
  function onPasswordChange(e: ChangeEvent<HTMLTextAreaElement>) {
    setPassword(e.currentTarget.value);
  }

  const onForgotPassword = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    redirectToPathWithParams(FORGOT_PASSWORD_PAGE, { userId: email }, router, window);
  };

  const isSigningUpValid = useMemo(() => {
    return AuthenticationController.isSignupValuesValid(firstName, lastName, email, password);
  }, [firstName, lastName, email, password]);

  return (
    <>
      <Script src={`https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`} />
      <AuthWrapper
        title={SIGNUP_PAGE_HEADER}
        description={SIGNUP_PAGE_SUB_HEADER}
        onSocialButtonClick={onSSOLoginClick}
      >
        <SignupBlock
          firstNameLbl={SIGNUP_PAGE_FIRSTNAME_LBL}
          lastNameLbl={SIGNUP_PAGE_LASTNAME_LBL}
          emailLbl={SIGNUP_PAGE_EMAIL_LBL}
          passwordLbl={SIGNUP_PAGE_PASSWORD_LBL}
          alreadtHaveAccountBtnLbl={ALREADY_HAVE_ACCOUNT_BTN_LBL}
          signUpBtnLbl={CREATE_ACCOUNT_BTN_LBL}
          signingUpLbl={CREATING_ACCOUNT_LBL}
          enableSignUpButton={isSigningUpValid}
          OnChangeOfFirstName={onFirstNameChange}
          OnChangeOfLastName={onLastNameChange}
          OnChangeOfEmail={onEmailChange}
          OnChangeOfPassword={onPasswordChange}
          onClickOfAlreadyHaveAccount={onGotToLogin}
          onClickOfSignUp={onSignUp}
          onForgotPassword={onForgotPassword}
          isSubmitting={isSigningUp}
        />
      </AuthWrapper>
    </>
  );
}

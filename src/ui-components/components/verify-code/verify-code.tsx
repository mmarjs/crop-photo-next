import React, { ChangeEvent, useState, useEffect, KeyboardEvent, MouseEventHandler } from "react";
import classNames from "classnames";
import { Label } from "../label";
import { PrimaryButton } from "../button";
import { Input } from "../input";
import { HLayout } from "../hLayout";
import { VLayout } from "../vLayout";

import styles from "./verify-code.module.scss";
import { LoadingOutlined } from "@ant-design/icons";
import IconCheckCircle from "../../assets/icons/icon-check-circle.svg";
import { toast } from "../toast";
import { Logger } from "aws-amplify";
import { t } from "i18next";
import useCountdown from "../../../hooks/useCountdown";

/**
 *
 */
export type VerifyCodeProps = {
  /**
   * a class name style to be rendered in the component.
   */
  className?: string;

  /**
   * a class name style to be rendered in the component.
   */
  labelClass?: string;

  /**
   *
   */
  label: string;

  /**
   *
   */
  submitButtonLabel: string;

  /**
   *
   */
  resendCodeBtnLbl?: string;

  /**
   *
   */
  onSubmitClick: (opt: string) => void;

  /**
   *
   */
  showResendCode?: boolean;

  /**
   *
   */
  onResendCodeClick?: (
    event: React.MouseEventHandler<HTMLParagraphElement> | undefined,
    onSuccess: Function,
    onError: Function
  ) => void;

  /**
   * Submitting status
   */
  isSubmitting?: boolean;

  /**
   * Auto Submit
   */
  autoSubmit?: boolean;

  /**
   * Resending status
   */
  isResending?: boolean;

  /**
   * Size
   */
  size?: "sm" | "lg";
  /**
   * Verify Error
   */
  verifyError?: string;

  /**
   *
   */
  onBackToSignIn?: MouseEventHandler<HTMLElement>;
};

/**
 *
 * @param param0
 * @returns
 */

export const VerifyCode = React.forwardRef(
  (
    {
      className,
      labelClass,
      label,
      submitButtonLabel,
      resendCodeBtnLbl,
      onSubmitClick,
      showResendCode,
      onResendCodeClick,
      isSubmitting,
      isResending,
      autoSubmit,
      size = "lg",
      verifyError,
      onBackToSignIn
    }: VerifyCodeProps,
    ref
  ) => {
    const RESEND_CODE_BTN_DEFAULT_LBL: string = resendCodeBtnLbl ? resendCodeBtnLbl : t("verify_code.resend_otp");
    const ANY_CODE_BLANK_ERR: string = t("verify_code.otp_cannot_be_blank");
    const INVALID_OTP_CODE_ERR: string = t("verify_code.invalid_otp_error");

    const [error, setError] = useState("");
    const [hideTimer, setHideTimer] = useState(false);
    const [input1Value, setInput1Value] = useState("");
    const [input2Value, setInput2Value] = useState("");
    const [input3Value, setInput3Value] = useState("");
    const [input4Value, setInput4Value] = useState("");
    const [input5Value, setInput5Value] = useState("");
    const [input6Value, setInput6Value] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [seconds, { start, stop, reset }] = useCountdown({ seconds: 30, interval: 1000 });
    const logger = new Logger("ui-components:components:verify-code");

    let input1, input2, input3, input4, input5, input6;

    useEffect(() => {
      start();
      return () => {
        stop();
      };
    }, []);

    useEffect(() => {
      if (seconds === -1) {
        stop();
        setHideTimer(true);
      }
    }, [seconds]);

    useEffect(() => {
      if (autoSubmit && (input1Value || input2Value || input3Value || input4Value || input5Value || input6Value)) {
        logger.debug("autoSubmit onSubmitHandler");
        onSubmitHandler();
      }
    }, [input1Value, input2Value, input3Value, input4Value, input5Value, input6Value]);

    /**
     *
     * @param value
     */
    function validateCode(value: string): boolean {
      logger.debug("validateCode", value);
      if (value && value.length > 0) {
        let digit = parseInt(value);
        if (digit < 0 || digit > 9) {
          // throw new Error(EACH_CODE_INCORRECT_ERR);
        }
      } else {
        logger.error("validateCode error", ANY_CODE_BLANK_ERR);
        throw new Error(ANY_CODE_BLANK_ERR);
      }
      return true;
    }

    /**
     *
     * @param currPos
     */
    function moveFocusOnNext(currPos: number): void {
      if (currPos >= 0 && currPos < 6) {
        let nextRefVar = eval("input" + (currPos + 1).toString());
        nextRefVar?.focus();
      }
    }

    /**
     *
     * @param currPos
     */
    function moveFocusOnPrev(currPos: number): void {
      if (currPos >= 0 && currPos <= 6) {
        let prevRefVar = eval("input" + (currPos - 1).toString());
        prevRefVar?.focus();
      }
    }

    /**
     *
     */
    function validateAndReturnOTPCode() {
      let codeStr = input1Value + input2Value + input3Value + input4Value + input5Value + input6Value;
      if (codeStr && codeStr.length == 6) {
        let code = parseInt(codeStr);
        if (code < 100000 && code > 999999) {
          throw new Error(INVALID_OTP_CODE_ERR);
        }
      } else {
        throw new Error(INVALID_OTP_CODE_ERR);
      }
      return codeStr;
    }

    /**
     *
     * @param e
     * @param position
     */
    function onKeyUpHandler(e: KeyboardEvent<HTMLInputElement>, position: number) {
      try {
        let value = e.currentTarget.value;
        let key = e.which;
        if (key == 8 && value.length == 0) {
          moveFocusOnPrev(position);
        }
      } catch (err: any) {
        console.log(err);
        //setError(err && err.message ? err.message : err.toString());
      }
    }

    /**
     *
     * @param e
     * @param position
     */
    function onInputChange(e: ChangeEvent<HTMLElement>, position: number) {
      try {
        let value = e.currentTarget instanceof HTMLInputElement ? e.currentTarget.value : "";
        let curInputSetFunc = eval("setInput" + position.toString() + "Value");
        curInputSetFunc(value);
        if (validateCode(value)) {
          if (value.length == 1) {
            moveFocusOnNext(position);
          }
        }
        if (value.length > 1) {
          const pasteValues = value.split("");
          pasteValues.map(pasteValue => {
            let curInputSetFunc = eval("setInput" + position.toString() + "Value");
            curInputSetFunc(pasteValue);
            moveFocusOnNext(position);
            if (position < 6) position++;
          });
        }
        setError("");
      } catch (err: any) {
        setError(err && err.message ? err.message : err.toString());
        setTimeout(() => {
          setError("");
        }, 10000);
      }
    }

    /**
     *
     * @param event
     */
    async function onSubmitHandler() {
      logger.debug("onSubmitHandler");
      try {
        let otpCode = validateAndReturnOTPCode();
        if (autoSubmit) {
          setSubmitting(true);
        }
        await onSubmitClick(otpCode);
        setSubmitted(true);
        setSubmitting(false);
      } catch (err: any) {
        logger.debug("onSubmitHandler error", err);
        if (!autoSubmit) {
          toast(err?.message || err.toString(), "error");
        }
        setError(err && err.message ? err.message : err.toString());
      }
    }

    /**
     *
     * @param event
     */
    async function onResendCodeHandler(event: any) {
      if (onResendCodeClick) {
        onResendCodeClick(
          event,
          () => {
            reset();
            start();
            setHideTimer(false);
          },
          () => {
            reset();
            setHideTimer(true);
          }
        );
      }
    }
    const sentNewOtp = t("verify_code.sent_new_otp");
    return (
      <div className={styles.Wrapper}>
        {!hideTimer ? (
          <p className={styles.resendTimer}>{`${sentNewOtp} 0:${seconds < 10 ? `0${seconds}` : seconds}`}</p>
        ) : (
          <p onClick={onResendCodeHandler} className={styles.resendLink}>
            {isResending ? t("verify_code.resending_otp") : RESEND_CODE_BTN_DEFAULT_LBL}
          </p>
        )}
        <VLayout noMargin={true} gap={10} className={className}>
          <VLayout noMargin={true} gap={8}>
            <Label labelText={label} customizeClassName={labelClass} />
            <HLayout noPadding={true} hAlign="flex-start" gap={16}>
              <Input
                ref={node => (input1 = node)}
                text={input1Value}
                customizeClassName={classNames(styles.inputBox, {
                  [styles.Small]: size === "sm"
                })}
                // disabled={parseInt(input1Value) >= 0 && parseInt(input1Value) <= 9}
                onChange={event => {
                  onInputChange(event, 1);
                }}
                onKeyUp={event => {
                  onKeyUpHandler(event as KeyboardEvent<HTMLInputElement>, 1);
                }}
              />
              <Input
                ref={node => (input2 = node)}
                text={input2Value}
                customizeClassName={classNames(styles.inputBox, {
                  [styles.Small]: size === "sm"
                })}
                // disabled={parseInt(input2Value) >= 0 && parseInt(input2Value) <= 9}
                onChange={event => {
                  onInputChange(event, 2);
                }}
                onKeyUp={event => {
                  onKeyUpHandler(event as KeyboardEvent<HTMLInputElement>, 2);
                }}
              />
              <Input
                ref={node => (input3 = node)}
                text={input3Value}
                customizeClassName={classNames(styles.inputBox, {
                  [styles.Small]: size === "sm"
                })}
                // disabled={parseInt(input3Value) >= 0 && parseInt(input3Value) <= 9}
                onChange={event => {
                  onInputChange(event, 3);
                }}
                onKeyUp={event => {
                  onKeyUpHandler(event as KeyboardEvent<HTMLInputElement>, 3);
                }}
              />
              <Input
                ref={node => (input4 = node)}
                text={input4Value}
                customizeClassName={classNames(styles.inputBox, {
                  [styles.Small]: size === "sm"
                })}
                // disabled={parseInt(input4Value) >= 0 && parseInt(input4Value) <= 9}
                onChange={event => {
                  onInputChange(event, 4);
                }}
                onKeyUp={event => {
                  onKeyUpHandler(event as KeyboardEvent<HTMLInputElement>, 4);
                }}
              />
              <Input
                ref={node => (input5 = node)}
                text={input5Value}
                customizeClassName={classNames(styles.inputBox, {
                  [styles.Small]: size === "sm"
                })}
                // disabled={parseInt(input5Value) >= 0 && parseInt(input5Value) <= 9}
                onChange={event => {
                  onInputChange(event, 5);
                }}
                onKeyUp={event => {
                  onKeyUpHandler(event as KeyboardEvent<HTMLInputElement>, 5);
                }}
              />
              <Input
                ref={node => (input6 = node)}
                text={input6Value}
                customizeClassName={classNames(styles.inputBox, {
                  [styles.Small]: size === "sm"
                })}
                // disabled={parseInt(input6Value) >= 0 && parseInt(input6Value) <= 9}
                onChange={event => {
                  onInputChange(event, 6);
                }}
                onKeyUp={event => {
                  onKeyUpHandler(event as KeyboardEvent<HTMLInputElement>, 6);
                }}
              />
              {autoSubmit && (
                <>
                  {submitting && <LoadingOutlined className={styles.LoadingIcon} />}
                  {!submitting && submitted && <IconCheckCircle className={styles.SubmittedIcon} />}
                </>
              )}
            </HLayout>
            {
              <Label
                customizeClassName={classNames({
                  [styles.ShowError]: error || verifyError,
                  [styles.HideError]: !error && !verifyError
                })}
                labelText={error || verifyError!}
              />
            }
          </VLayout>
          {(showResendCode || !autoSubmit) && (
            <HLayout noPadding={true} noFlex={true} hAlign="flex-end">
              {/* <LinkButton label="Back to Sign in" onClick={onBackToSignIn} htmlType="button" /> */}
              {!autoSubmit && (
                <PrimaryButton
                  label={isSubmitting ? t("verify_code.verifying_code") : submitButtonLabel}
                  onClick={onSubmitHandler}
                  loading={isSubmitting}
                />
              )}
            </HLayout>
          )}
        </VLayout>
      </div>
    );
  }
);

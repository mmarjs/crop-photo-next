import React, {
  useMemo,
  ChangeEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
  useState,
  ReactNode
} from "react";
import { Input as AntInput } from "antd";
import { Label } from "../label"; //'@evolphin/library.components.label';
import EyeVisibleIcon from "../../../../public/images/eye-visible.svg";
import EyeInvisibleIcon from "../../../../public/images/eye-invisible.svg";
import isNaN from "lodash/isNaN";
import isNumber from "lodash/isNumber";

//@ts-ignore
import styles from "./input.module.scss";
import classNames from "classnames";

import IconCheckCircle from "../../assets/icons/icon-check-circle.svg";
import { ChangeEvent } from "react";
import AuthenticationController, { PasswordValidationError } from "../../../controller/AuthenticationController";
import useDebounce from "../../../hooks/useDebounce";
import { Button } from "../button";

export interface InputProps {
  /**
   * placeholder text for input-box.
   */
  placeholder?: string;
  /**
   * pre rendered text
   */
  text?: string | number;
  /**
   * Type of the input box
   */
  type?: "input" | "text" | "search" | "password" | "date" | "email" | string;
  /**
   * Mandatory field check
   */
  mandatory?: boolean;
  /**
   * Customize class name
   */
  customizeClassName?: string;
  /**
   * On change method of input box
   */
  onChange?: ChangeEventHandler<HTMLElement>;

  /**
   * On change method of input box
   */
  onKeyUp?: KeyboardEventHandler<HTMLElement>;

  /**
   * name of the input box
   */
  name?: string;
  /**
   * is outer label
   */
  outerLabel?: boolean;
  /**
   * label text
   */
  labelText?: string;
  /**
   * is link with label
   */
  isLinkWithLabel?: boolean;
  /**
   * link text
   */
  linkText?: string;

  /**
   * onclick of link button
   */
  onClickOfLink?: MouseEventHandler<HTMLElement>;

  /*
   * Validation
  /**
   * onEnter key press of Input text value
   */
  onPressEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void;

  validation?: boolean;

  /*
  addonBefore
  */
  addonBefore?: string;

  /*
  addonAfter
  */
  addonAfter?: string;
  /*
  addonAfter
  */
  min?: number;
  /*
  addonAfter
  */
  max?: number;
  /*
  addonAfter
  */
  step?: number;

  /**
   * On Blur method of input box
   */
  onBlur?: ChangeEventHandler<HTMLElement>;
  value?: any;

  /**
   * Disabled
   */
  disabled?: boolean;

  /**
   * Tab Index
   */
  tabIndex?: number;
  /**
   * debounce value
   */
  debounce?: number;
  prefix?: ReactNode;
  suffix?: ReactNode;
  title?: string;
  defaultValue?: string;
  status?: "" | "error" | "warning" | undefined;
}

/**
 * Input functional component.
 */
// eslint-disable-next-line react/display-name
export const Input = React.forwardRef(
  (
    {
      title,
      text,
      placeholder = "",
      type = "text",
      mandatory = false,
      customizeClassName,
      onChange,
      onKeyUp,
      name,
      outerLabel = false,
      labelText = "",
      isLinkWithLabel = false,
      linkText = "",
      onClickOfLink,
      validation,
      addonAfter,
      addonBefore,
      onPressEnter,
      min,
      max,
      onBlur,
      disabled,
      tabIndex,
      debounce,
      prefix,
      suffix,
      defaultValue,
      status
    }: InputProps,
    ref?: React.Ref<any>
  ) => {
    const [isFocus, setFocus] = useState(false);
    const [passwordError, setPasswordError] = useState<PasswordValidationError>();
    const [inputText, setInputText] = useState<string>(defaultValue || "");
    const debouncedValue = debounce ? useDebounce(inputText, debounce) : "";

    const isValid = useMemo(() => {
      if (validation && debounce) {
        switch (type) {
          case "password":
            setPasswordError(AuthenticationController.validatePassword(debouncedValue));
            try {
              return AuthenticationController.isValidPassword(debouncedValue);
            } catch (e) {
              return false;
            }
          case "email":
            try {
              return AuthenticationController.isValidEmail(debouncedValue);
            } catch (e) {
              return false;
            }
          default:
            if (name) {
              try {
                if (name === "firstName") {
                  return AuthenticationController.validateFirstName(debouncedValue);
                }
                if (name === "lastName") {
                  return AuthenticationController.validateLastName(debouncedValue);
                }
              } catch (error: any) {
                return false;
              }
            }
            return true;
        }
      }
    }, [debouncedValue, debounce, name, type]);

    const onPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
      setInputText(e.target.value);
      !!onChange && onChange(e);
    };

    const onEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
      setInputText(e.target.value);
      !!onChange && onChange(e);
    };

    const onInputChange = (e: ChangeEvent<HTMLInputElement>, key?: string) => {
      setInputText(e.target.value);
      !!onChange && onChange(e);
    };

    const onNumberInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);
      if (!isNaN(value) && isNumber(value)) {
        setInputText(e.target.value);
        !!onChange && onChange(e);
      }
    };

    return (
      <div className={classNames(styles.inputBoxDiv, customizeClassName)}>
        {outerLabel && (
          <div className={styles.inputBoxLabelDiv}>
            <Label
              customizeClassName={classNames(styles.outerLabel, {
                [styles.labelWithLink]: isLinkWithLabel
              })}
              labelText={labelText}
            />
            {isLinkWithLabel && (
              <a tabIndex={-1} className={styles.inputBoxLink} type="button" onClick={onClickOfLink} href="#">
                {linkText}
              </a>
            )}
          </div>
        )}
        {type === "password" ? (
          <>
            <AntInput.Password
              prefix={prefix}
              suffix={suffix}
              ref={ref}
              value={text}
              name={name}
              className={classNames(styles.inputBox, {
                [styles.InputWithLabel]: !!outerLabel,
                [styles.InputNotValid]: validation && !isValid && debouncedValue
              })}
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              autoComplete="new-password"
              placeholder={placeholder}
              onChange={onPasswordChange}
              iconRender={(visible: boolean) => (visible ? <EyeVisibleIcon /> : <EyeInvisibleIcon />)}
              required={mandatory}
              disabled={disabled}
              tabIndex={tabIndex}
            />
            {validation && (
              <div className={classNames(styles.ValidationWrapper)}>
                {/*{!isValid && !isValid && debouncedValue && (*/}
                {/*<p className={styles.ValidationError}>*/}
                {/*Your password does not meet our requirements (*/}
                {/*{AuthenticationController.PASSWORD_MIN_SPECIAL_CHARACTER_COUNT}+ special character, uppercase*/}
                {/*letter, number and a minimum of {AuthenticationController.PASSWORD_MINIMUM_CHARACTER_COUNT}{" "}*/}
                {/*characters)*/}
                {/*</p>*/}
                {/*)}*/}
                {isFocus && (
                  <ul className={styles.Popup}>
                    <li>
                      <IconCheckCircle
                        className={classNames(styles.CheckIcon, {
                          [styles.ValidationPassed]: passwordError && !passwordError.isSplCharCountNotValid
                        })}
                      />
                      Special character
                    </li>
                    <li>
                      <IconCheckCircle
                        className={classNames(styles.CheckIcon, {
                          [styles.ValidationPassed]: passwordError && !passwordError.isUpperCaseCountNotValid
                        })}
                      />
                      {AuthenticationController.PASSWORD_MIN_UPPERCASE_CHARACTER_COUNT}+ uppercase
                    </li>
                    <li>
                      <IconCheckCircle
                        className={classNames(styles.CheckIcon, {
                          [styles.ValidationPassed]: passwordError && !passwordError.isLowerCaseCountNotValid
                        })}
                      />
                      {AuthenticationController.PASSWORD_MIN_LOWERCASE_CHARACTER_COUNT}+ lowercase
                    </li>
                    <li>
                      <IconCheckCircle
                        className={classNames(styles.CheckIcon, {
                          [styles.ValidationPassed]: passwordError && !passwordError.isDigitCountNotValid
                        })}
                      />
                      {AuthenticationController.PASSWORD_MIN_DIGIT_CHARACTER_COUNT}+ number
                    </li>
                    <li>
                      <IconCheckCircle
                        className={classNames(styles.CheckIcon, {
                          [styles.ValidationPassed]: passwordError && !passwordError.isCharCountNotValid
                        })}
                      />
                      {AuthenticationController.PASSWORD_MINIMUM_CHARACTER_COUNT}+ characters
                    </li>
                  </ul>
                )}
              </div>
            )}
          </>
        ) : type === "email" ? (
          <>
            <AntInput
              defaultValue={defaultValue}
              title={title}
              prefix={prefix}
              suffix={suffix}
              ref={ref}
              value={text}
              name={name}
              className={classNames(styles.inputBox, {
                [styles.InputWithLabel]: !!outerLabel,
                [styles.InputNotValid]: validation && !isValid && debouncedValue
              })}
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              autoComplete="email"
              placeholder={placeholder}
              onChange={onEmailChange}
              required={mandatory}
              disabled={disabled}
              tabIndex={tabIndex}
              type="email"
            />
            {validation && debouncedValue && !isValid ? (
              <div className={styles.ValidationWrapper}>
                <p className={styles.ValidationError}>{AuthenticationController.INVALID_EMAIL_ADDRESS}</p>
              </div>
            ) : null}
          </>
        ) : type === "number" ? (
          <>
            <AntInput
              prefix={prefix}
              suffix={suffix}
              ref={ref}
              value={text}
              name={name}
              className={classNames(styles.inputBox, {
                [styles.InputWithLabel]: !!outerLabel
              })}
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              placeholder={placeholder}
              onChange={onNumberInputChange}
              required={mandatory}
              disabled={disabled}
              tabIndex={tabIndex}
              type="text"
              defaultValue={defaultValue}
            />
          </>
        ) : (
          <>
            <AntInput
              prefix={prefix}
              suffix={suffix}
              ref={ref}
              value={text}
              type={type}
              name={name}
              title={title}
              className={classNames(styles.inputBox, {
                [styles.InputWithLabel]: !!outerLabel,
                [styles.InputNotValid]: validation && !isValid && debouncedValue
              })}
              autoComplete="new-text"
              placeholder={placeholder}
              onChange={onInputChange}
              onKeyUp={onKeyUp}
              addonBefore={addonBefore}
              addonAfter={addonAfter}
              min={min}
              max={max}
              onBlur={onBlur}
              onPressEnter={onPressEnter}
              required={mandatory}
              disabled={disabled}
              tabIndex={tabIndex}
              defaultValue={defaultValue}
              status={status}
            />
            {validation && !isValid && debouncedValue ? (
              <div className={styles.ValidationWrapper}>
                {name === "firstName" ? (
                  <p className={styles.ValidationError}>{AuthenticationController.INVALID_FIRST_NAME}</p>
                ) : null}
                {name === "lastName" ? (
                  <p className={styles.ValidationError}>{AuthenticationController.INVALID_LAST_NAME}</p>
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </div>
    );
  }
);

interface InputWithButtonProps {
  inputProps: {
    placeholder: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPressEnter?: () => void;
    value?: string;
    type?: string;
    title?: string;
  };
  buttonProps: {
    label: string;
    type?: "text" | "link" | "primary";
    disabled?: boolean;
    onClick?: () => void;
    loading?: boolean;
  };
  errorMessage?: string;
  defaultBorder?: boolean;
}

export const InputWithButton = React.forwardRef<HTMLInputElement, InputWithButtonProps>(
  ({ inputProps, buttonProps, errorMessage, defaultBorder }) => {
    return (
      <div className={classNames(styles.urlInput)}>
        <div
          className={classNames(styles.urlInputWrapper, {
            [styles.hasError]: !!inputProps?.value && !!errorMessage,
            [styles.hasValue]: !!inputProps?.value,
            [styles.isValid]: !!inputProps?.value && !errorMessage,
            [styles.defaultBorder]: defaultBorder
          })}
        >
          <Input
            placeholder={inputProps.placeholder}
            onChange={inputProps?.onChange}
            text={inputProps?.value || ""}
            type={inputProps?.type || "text"}
            title={inputProps?.title}
            onPressEnter={inputProps?.onPressEnter}
          />
          <Button
            label={buttonProps.label}
            type={buttonProps?.type || "primary"}
            disabled={buttonProps?.disabled || !!errorMessage || false}
            onClick={buttonProps.onClick}
            loading={buttonProps?.loading || false}
          />
        </div>
        {!!inputProps?.value && !!errorMessage ? <span className={styles.errorMessage}>{errorMessage}</span> : null}
      </div>
    );
  }
);

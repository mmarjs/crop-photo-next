import React, { MouseEventHandler, ChangeEventHandler, useEffect, useRef } from "react";
import { Input as AntInput, InputRef } from "antd";
import { InputWithOuterLabel, InputWithOuterLabelAndLink } from "../input"; //'@evolphin/library.components.input';
import { Button, PrimaryButton } from "../button"; //'@evolphin/library.components.button';

import { VLayout } from "../vLayout";
import { HLayout } from "../hLayout";

/**
 *
 */
export type SignupBlockProps = {
  /**
   *
   */
  firstNameLbl?: string;

  /**
   *
   */
  lastNameLbl?: string;

  /**
   *
   */
  emailLbl?: string;

  /**
   *
   */
  passwordLbl?: string;

  /**
   *
   */
  signUpBtnLbl?: string;

  /**
   *
   */
  signingUpLbl?: string;

  /**
   *
   */
  alreadtHaveAccountBtnLbl?: string;

  /**
   *
   */
  enableSignUpButton?: boolean;

  /**
   * onClick function of sign up.
   */
  onClickOfSignUp: Function;

  /**
   * onClick function of already have an account
   */
  onClickOfAlreadyHaveAccount?: React.MouseEventHandler<HTMLElement>;

  /**
   * onChange of First Name text value
   */
  OnChangeOfFirstName?: ChangeEventHandler<HTMLElement>;

  /**
   * onChange of First Name text value
   */
  OnChangeOfLastName?: ChangeEventHandler<HTMLElement>;

  /**
   * onChange of First Name text value
   */
  OnChangeOfEmail?: ChangeEventHandler<HTMLElement>;

  /**
   * onChange of First Name text value
   */
  OnChangeOfPassword?: ChangeEventHandler<HTMLElement>;

  /**
   * on forgot password aount button handler
   */
  onForgotPassword?: MouseEventHandler<HTMLElement>;

  /**
   * Submitting status
   */
  isSubmitting: boolean;

  /**
   * class name
   */
  className?: string;
};

/**
 *
 * @param param0
 * @returns
 */
const SignupBlock = ({
  firstNameLbl = "First Name",
  lastNameLbl = "Last Name",
  emailLbl = "Enter Work Email",
  passwordLbl = "Enter Password",
  alreadtHaveAccountBtnLbl = "I already have an account",
  signUpBtnLbl = "Create an account",
  signingUpLbl = "Creating an account",
  enableSignUpButton,
  onClickOfSignUp,
  onClickOfAlreadyHaveAccount,
  OnChangeOfFirstName,
  OnChangeOfLastName,
  OnChangeOfEmail,
  OnChangeOfPassword,
  onForgotPassword,
  isSubmitting
}: SignupBlockProps) => {
  const firstnameRef = useRef<any>(null);

  useEffect(() => {
    firstnameRef?.current?.focus();
  }, [firstnameRef]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onClickOfSignUp();
  };

  return (
    <form onSubmit={onSubmit} style={{ marginBottom: 24 }}>
      <VLayout noMargin={true} gap={24}>
        <HLayout noPadding={true}>
          <div style={{ width: "100%", marginRight: "16px" }}>
            <InputWithOuterLabel
              ref={firstnameRef}
              labelText={firstNameLbl}
              placeholder="John"
              onChange={OnChangeOfFirstName}
              tabIndex={1}
              validation
              name="firstName"
              debounce={250}
            />
          </div>

          <InputWithOuterLabel
            labelText={lastNameLbl}
            placeholder="Doe"
            onChange={OnChangeOfLastName}
            tabIndex={2}
            validation
            name="lastName"
            debounce={250}
          />
        </HLayout>
        <InputWithOuterLabel
          tabIndex={3}
          type="email"
          labelText={emailLbl}
          placeholder="john@doe.com"
          onChange={OnChangeOfEmail}
          validation
          debounce={250}
        />
        <InputWithOuterLabel
          type="password"
          labelText={passwordLbl}
          placeholder="**********"
          onChange={OnChangeOfPassword}
          linkText="Forgot password?"
          onClickOfLink={onForgotPassword}
          validation
          tabIndex={4}
          debounce={250}
        />
        <HLayout noPadding={true} noFlex={true} hAlign="space-between" style={{ marginTop: 24 }}>
          <Button label={alreadtHaveAccountBtnLbl} htmlType="button" onClick={onClickOfAlreadyHaveAccount} />
          <PrimaryButton
            tabIndex={5}
            label={isSubmitting ? signingUpLbl : signUpBtnLbl}
            disabled={!enableSignUpButton}
            htmlType="submit"
            loading={isSubmitting}
          />
        </HLayout>
      </VLayout>
    </form>
  );
};

export default SignupBlock;

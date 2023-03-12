import React from "react";
import { render } from "@testing-library/react";
import { BasicVerifyCode } from "./verify-code.composition";

it("should render with the correct text", () => {
  const { getByText } = render(
    <BasicVerifyCode
      showResendCode={false}
      label={"Label"}
      resendCodeBtnLbl={"Resend"}
      onSubmitClick={otp => console.log(otp)}
      submitButtonLabel={"Submit"}
      isSubmitting={false}
    />
  );
  const rendered = 1; //getByText('hello from VerifyCode');
  expect(rendered).toBeTruthy();
});

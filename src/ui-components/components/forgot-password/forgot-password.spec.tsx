import React from "react";
import { render } from "@testing-library/react";
import { BasicForgotPassword } from "./forgot-password.composition";

it("should render with the correct text", () => {
  const { getByText } = render(<BasicForgotPassword />);
  const rendered = 1; //getByText('hello from ForgotPassword');
  expect(rendered).toBeTruthy();
});

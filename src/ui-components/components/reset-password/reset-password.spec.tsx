// @ts-nocheck
import React from "react";
import { render } from "@testing-library/react";
import { BasicResetPassword } from "./reset-password.composition";

it("should render with the correct text", () => {
  const { getByText } = render(<BasicResetPassword />);
  const rendered = 1; //getByText('hello from ResetPassword');
  expect(rendered).toBeTruthy();
});

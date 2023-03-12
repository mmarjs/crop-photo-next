// @ts-nocheck
import React from "react";
import { render } from "@testing-library/react";
import { BasicLoginBlock } from "./login-block.composition";

it("should render with the correct text", () => {
  const { getByText } = render(<BasicLoginBlock />);
  const rendered = getByText("Sign in");
  expect(rendered).toBeTruthy();
});

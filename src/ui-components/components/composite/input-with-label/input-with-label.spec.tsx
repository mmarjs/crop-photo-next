import React from "react";
import { render } from "@testing-library/react";
import { BasicInputWithLabel } from "./input-with-label.composition";

it("should render with the correct text", () => {
  const { getByText } = render(<BasicInputWithLabel labelText="hello from InputWithLabel" />);
  const rendered = getByText("hello from InputWithLabel");
  expect(rendered).toBeTruthy();
});

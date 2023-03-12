import React from "react";
import { render } from "@testing-library/react";
import { BasicToggleBtn } from "./toggle-btn.composition";

it("should render with the correct text", () => {
  const { getByText } = render(<BasicToggleBtn />);
  const rendered = getByText("hello from ToggleBtn");
  expect(rendered).toBeTruthy();
});

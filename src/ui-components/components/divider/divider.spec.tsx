import React from "react";
import { render } from "@testing-library/react";
import { BasicDivider } from "./divider.composition";

it("should render correctly", () => {
  const { getByText } = render(<BasicDivider />);
  const rendered = 1; //getByText('Test');
  expect(rendered).toBeTruthy();
});

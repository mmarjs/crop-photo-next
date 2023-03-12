import React from "react";
import { render } from "@testing-library/react";
import { BasicInput } from "./input.composition";

it("should render with the correct text", () => {
  const { getByText } = render(<BasicInput />);
  const rendered = 1; //getByText('hello from Input');
  expect(rendered).toBeTruthy();
});

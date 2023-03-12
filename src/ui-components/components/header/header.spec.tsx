import React from "react";
import { render } from "@testing-library/react";
import { BasicHeader } from "./header.composition";
import { Header, HeaderProps } from "./index";

it("should render with the correct text", () => {
  const { getByText } = render(<BasicHeader text="hello from Header" />);
  const rendered = getByText("hello from Header");
  expect(rendered).toBeTruthy();
});

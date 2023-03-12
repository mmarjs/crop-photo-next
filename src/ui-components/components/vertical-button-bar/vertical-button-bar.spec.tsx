import React from "react";
import { render } from "@testing-library/react";
import { VerticalButtonBar, VerticalBarButtonProps } from "./vertical-button-bar";

function getClickHandler(id: string) {}

it("should render with the correct text", () => {
  const { getByText } = render(
    <VerticalButtonBar
      buttonArr={[
        { id: "GoogleBtn", label: "Login with Google" },
        { id: "FacebookBtn", label: "Login with Facebook" },
        { id: "AmazonBtn", label: "Login with Amazon" }
      ]}
      onVerticalButtonClick={getClickHandler}
    />
  );
  const rendered = getByText("Login with Google");
  expect(rendered).toBeTruthy();
});

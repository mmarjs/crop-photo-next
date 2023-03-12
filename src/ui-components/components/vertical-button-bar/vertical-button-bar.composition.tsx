import React from "react";
import { VerticalBarButtonProps } from ".";
import { VerticalButtonBar, VerticalButtonBarProps } from "./vertical-button-bar";

function getLoginBtnArr() {
  let btnArr: Array<VerticalBarButtonProps> = [];
  let googleButton: VerticalBarButtonProps = {
    id: "Google",
    label: "Login with google"
  };
  btnArr.push(googleButton);

  let fbButton: VerticalBarButtonProps = {
    id: "Facebook",
    label: "Login with facebook"
  };
  btnArr.push(fbButton);

  let amazonButton: VerticalBarButtonProps = {
    id: "Amazon",
    label: "Login with amazon"
  };
  btnArr.push(amazonButton);
  return btnArr;
}

/**
 *
 * @param props
 * @returns
 */
export const LoginVerticalButtonBar = (onVerticalButtonClick: (id: string) => void) => (
  <VerticalButtonBar buttonArr={getLoginBtnArr()} onVerticalButtonClick={onVerticalButtonClick} />
);

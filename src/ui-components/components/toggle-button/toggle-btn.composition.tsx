import React from "react";
import { ToggleBtn } from "./toggle-btn";

export const BasicToggleBtn = () => (
  <ToggleBtn
    text="hello from ToggleBtn"
    checked
    toggleCheck={checked => {
      console.log(checked);
    }}
  />
);

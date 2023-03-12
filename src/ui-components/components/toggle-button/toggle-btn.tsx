import React from "react";
import { Switch } from "antd";
import classNames from "classnames";
import styles from "./toggle-btn.module.scss";
import { ComponentProp } from "../../../common/Types";

export type ToggleBtnProps = ComponentProp & {
  /**
   * a text to be rendered in the component.
   */
  text: string;
  checked: boolean;
  toggleCheck: (checked: boolean) => void;
};

export function ToggleBtn({ text, className, checked, toggleCheck }: ToggleBtnProps) {
  return (
    <div className={classNames(styles.Wrapper, className)}>
      <Switch checked={checked} onChange={v => toggleCheck(v)} />
      {text}
    </div>
  );
}

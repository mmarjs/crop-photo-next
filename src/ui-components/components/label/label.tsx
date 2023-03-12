import classNames from "classnames";
import React from "react";
import styles from "./label.module.scss";

export type LabelProps = {
  /**
   * a label text to be rendered in the component.
   */
  labelText: string;
  /**
   * class name
   */
  customizeClassName?: string;
};

export function Label({ labelText, customizeClassName }: LabelProps) {
  return <label className={classNames(customizeClassName, styles.CustomLabel)}>{labelText}</label>;
}

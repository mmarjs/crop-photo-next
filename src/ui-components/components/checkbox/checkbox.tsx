import React, { MouseEventHandler } from "react";
import classNames from "classnames";
import { Checkbox as AntCheckbox } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import styles from "./checkbox.module.scss";
import { ComponentProp } from "../../../common/Types";

export type CheckboxProps = ComponentProp & {
  /**
   * a text to be rendered in the component.
   */
  text?: string;

  /**
   * onChange function
   */
  onChange?: (e: CheckboxChangeEvent) => void;

  /**
   * onClick function
   */
  onClick?: MouseEventHandler<HTMLElement>;

  /**
   * Checked status
   */
  checked?: boolean;

  /**
   * indeterminate status
   */
  indeterminate?: boolean;

  /**
   * name
   */
  name?: string;
  defaultChecked?: boolean;
};

export function Checkbox({
  text,
  onChange,
  onClick,
  className,
  checked,
  indeterminate,
  name,
  defaultChecked
}: CheckboxProps) {
  return (
    <>
      <AntCheckbox
        className={classNames(styles.Wrapper, className)}
        onChange={onChange}
        onClick={onClick}
        checked={checked}
        indeterminate={indeterminate}
        name={name}
        defaultChecked={defaultChecked}
      >
        {text}
      </AntCheckbox>
    </>
  );
}

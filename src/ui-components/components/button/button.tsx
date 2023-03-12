// @ts-nocheck
import React, { ReactNode } from "react";
import { Button as AntButton } from "antd";

//CSS - imports
import classnames from "classnames";

import styles from "./button.module.scss";
import { stringList } from "aws-sdk/clients/datapipeline";

/**
 *
 */
export type ButtonProps = {
  /**
   * ID for the button
   */
  id?: string;
  /**
   * label to be rendered in the component.
   */
  label?: string;

  /**
   * icon to be rendered in the component.
   */
  icon?: ReactNode;

  /**
   * icon position at which icon is to be rendered.
   */
  iconPosition?: "left" | "right";

  /**
   * type of button to be rendered.
   */
  type?: "primary" | "ghost" | "dashed" | "link" | "text" | "default";

  /**
   * href for the link button.
   */
  href?: string;

  /**
   * html type of the button.
   */
  htmlType?: "submit" | "reset" | "button";

  /**
   * button to be disabled or not.
   */
  disabled?: boolean;

  /**
   * button to be loading type or not.
   */
  loading?: boolean;

  /**
   * button to be of ghost type.
   */
  ghost?: boolean;

  /**
   * button to be of danger type.
   */
  danger?: boolean;

  /**
   * outer shape of the button.
   */
  shape?: "circle" | "round";

  /**
   * css styling object
   */
  className?: string;

  /**
   * stle object to override all styles if needed
   */
  style?: Object;

  /**
   * Size of the button
   */
  size?: string;

  /**
   * onClick function of the button.
   */
  onClick?: React.MouseEventHandler<HTMLElement>;
  /**
   * css styling object for label
   */
  labelClassName?: string;

  /**
   * Children content
   */
  children?: ReactNode;

  /**
   * Tab Index
   */
  tabIndex?: number;
  /**
   * form attribute for button to link it to a form
   */
  formId?: string;
};

/**
 *
 * @returns ReactComponent
 */
export function Button({
  id,
  label,
  icon,
  iconPosition = "left",
  type = "default",
  href,
  htmlType,
  disabled = false,
  loading = false,
  ghost = false,
  danger = false,
  shape,
  className,
  onClick,
  size = "lg",
  children,
  style,
  labelClassName,
  tabIndex,
  formId
}: ButtonProps) {
  return (
    <AntButton
      id={id}
      tabIndex={tabIndex}
      className={classnames(styles.Button, className, `btn-${size}`, {
        [styles.WithIconAtLeft]: icon && label && iconPosition === "left",
        [styles.WithIconAtRight]: icon && label && iconPosition === "right",
        [styles.IconOnly]: icon && !label
      })}
      icon={icon}
      type={type}
      href={href}
      htmlType={htmlType ? htmlType : formId ? "submit" : undefined}
      disabled={disabled}
      loading={loading}
      shape={shape}
      ghost={ghost}
      danger={danger}
      onClick={onClick}
      style={style}
      form={formId}
      // htmlType={formId ? "submit" : undefined}
    >
      {!icon && iconPosition == "left" && icon}
      <span className={labelClassName ? labelClassName : ""}>{label}</span>
      {children}
      {!icon && iconPosition == "right" && icon}
    </AntButton>
  );
}

import classNames from "classnames";
import React from "react";
import { Button, ButtonProps } from "./button";

import styles from "./button.module.scss";

/**
 *
 * @param props
 * @returns
 */
export const TextButton = (props: ButtonProps) => <Button type={"text"} {...props} />;

/**
 *
 * @param props
 * @returns
 */
export const LinkButton = (props: ButtonProps) => <Button type={"link"} {...props} />;

/**
 *
 * @param props
 * @returns
 */
export const PrimaryButton = (props: ButtonProps) => <Button type={"primary"} {...props} />;

/**
 *
 * @param props
 * @returns
 */
export const GhostButton = (props: ButtonProps) => <Button type={"ghost"} {...props} />;

/**
 *
 * @param props : ButtonProps
 * @returns Button
 */
export const DestructiveButton = (props: ButtonProps) => (
  <Button className={classNames(styles.destructivebutton, props.className)} {...props} />
);

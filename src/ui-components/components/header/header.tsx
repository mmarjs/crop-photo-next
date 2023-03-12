import React from "react";
import { HLayout } from "../hLayout";
import { VLayout } from "../vLayout";

import classnames from "classnames";
import styles from "./header.module.scss";

/**
 *
 */
export type HeaderProps = {
  /**
   * a text to be rendered in the component.
   */
  text: string;

  /**
   * a text to be rendered in the component.
   */
  subText?: string;

  /**
   * css class to be rendered in the component.
   */
  className?: string;

  /**
   * css class of text to be rendered in the component.
   */
  headerClass?: string;

  /**
   * css class of sub text to be rendered in the component.
   */
  subHeaderClass?: string;
};

/**
 *
 * @param param0
 * @returns
 */
export function Header({ text, subText, className, headerClass, subHeaderClass }: HeaderProps) {
  return (
    <VLayout className={classnames(className)}>
      <div className={classnames(styles.header, headerClass)}>{text}</div>
      <div className={classnames(styles.subHeader, subHeaderClass)}>{subText ? subText : null}</div>
    </VLayout>
  );
}

import React, { ReactChild } from "react";

//Import CSS
import classnames from "classnames";
//@ts-ignore
import styles from "./vlayout.module.scss";

/**
 *
 */
export type VLayoutProps = {
  /**
   *
   */
  className?: string;

  /**
   *
   */
  hAlign?: "left" | "center" | "right";

  /**
   *
   */
  vAlign?: "top" | "middle" | "bottom";

  /**
   * No margin
   */
  noMargin?: boolean;

  /**
   * No flex
   */
  noFlex?: boolean;

  /**
   * children to be rendered in the component.
   */
  children: React.ReactNode;

  /**
   * Gap between sections
   */
  gap?: number;

  /**
   * Inline styles
   */
  style?: React.CSSProperties;
};

/**
 *
 * @param param0
 * @returns
 */
export function VLayout({
  className,
  hAlign = "left",
  vAlign = "middle",
  noMargin = false,
  noFlex = false,
  children,
  gap = 0,
  style
}: VLayoutProps) {
  return (
    <div
      className={classnames(styles.vlayout, className, {
        [styles.NoMargin]: noMargin,
        [styles.NoFlex]: noFlex
      })}
      style={{ ...(style ?? {}), textAlign: hAlign, verticalAlign: vAlign, gridGap: gap, gap }}
    >
      {children}
    </div>
  );
}

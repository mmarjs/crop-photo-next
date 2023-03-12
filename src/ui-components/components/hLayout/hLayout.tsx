import React from "react";

//Import CSS
import classnames from "classnames";
//@ts-ignore
import styles from "./hlayout.module.scss";

export type HLayoutProps = {
  /**
   *
   */
  className?: string;

  /**
   *
   */
  vAlign?: "flex-start" | "center" | "flex-end" | "unset";

  /**
   *
   */
  hAlign?: "flex-start" | "center" | "flex-end" | "space-between" | "space-around" | "unset";

  /**
   * No padding
   */
  noPadding?: boolean;

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
   * Grid styles
   */
  grid?: boolean;

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
export function HLayout({
  className,
  hAlign = "center",
  vAlign = "center",
  noPadding = false,
  noFlex = false,
  grid = false,
  children,
  gap = 0,
  style
}: HLayoutProps) {
  return (
    <div
      className={classnames(styles.hlayout, className, {
        [styles.NoPadding]: noPadding,
        [styles.NoFlex]: noFlex,
        [styles.Grid]: grid
      })}
      style={{ ...(style ?? {}), justifyContent: hAlign, alignItems: vAlign, gap }}
    >
      {children}
    </div>
  );
}

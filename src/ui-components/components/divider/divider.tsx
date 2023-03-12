import React from "react";
import { Divider as AntDivider, DividerProps as AntDividerProps } from "antd";

/**
 *
 */
export type DividerProps = {
  type?: "horizontal" | "vertical";
  orientation?: "left" | "right" | "center";
  className?: string;
  children?: React.ReactNode;
  dashed?: boolean;
};

/**
 *
 * @param param0
 * @returns
 */
export function Divider({ type = "horizontal", orientation = "center", className, children, dashed }: DividerProps) {
  return (
    <AntDivider type={type} orientation={orientation} className={className} dashed={dashed}>
      {children}
    </AntDivider>
  );
}

import { Tooltip as AntTooltip } from "antd";
import { TooltipPlacement } from "antd/lib/tooltip";
import { ReactNode } from "react";
import { ComponentProp } from "../../../common/Types";

export type TooltipProps = ComponentProp & {
  title: ReactNode | (() => ReactNode);
  placement: TooltipPlacement;
  color?: string;
};

export const Tooltip = ({ title, placement = "top", color = "#E5E5E5", children }: TooltipProps) => {
  return (
    <AntTooltip overlayInnerStyle={{ color: "#626970" }} color={color} title={title} placement={placement}>
      {children}
    </AntTooltip>
  );
};

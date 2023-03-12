import React from "react";
import AntIcon from "@ant-design/icons";
import { CustomIconComponentProps } from "@ant-design/icons/lib/components/Icon";

/**
 *
 */
export type IconProps = {
  /**
   *
   */
  src?: string;

  /**
   *
   */
  className?: string;

  /**
   * a component to be rendered in the component.
   */
  component?: React.ComponentType<CustomIconComponentProps | React.SVGProps<SVGSVGElement>>;
};

/**
 *
 * @param param0
 * @returns
 */
export function Icon({ className, component }: IconProps) {
  return <AntIcon className={className} component={component} />;
}

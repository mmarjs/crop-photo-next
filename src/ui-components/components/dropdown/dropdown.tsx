import React, { ReactNode } from "react";
import styles from "./dropdown.module.scss";
import { Menu, Dropdown as AntDropdown, Button } from "antd";
import classnames from "classnames";

/**
 *
 */
export type DropdownMenuProps = {
  id: string;
  /**
   * label for the menu item
   */
  label: string;

  /**
   * click function for the menu item
   */
  onClick: React.MouseEventHandler<HTMLDivElement>;
};

export type DropdownProps = {
  /**
   * ID of the project
   */
  dropdownItems?: Array<DropdownMenuProps>;
  /**
   * label of dropdown button
   */
  label?: string;
  /**
   * menu open trigger on event i.e hover/click
   */
  triggerOn?: "hover" | "click";
  /**
   * default placement of the menu list
   */
  placement?: "bottomLeft" | "topLeft" | "topCenter" | "topRight" | "bottomCenter" | "bottomRight" | undefined;
  /**
   * classnames to override styling
   */
  className?: string;
  /**
   * style to add inline CSS on top of all CSSs
   */
  style?: Object;

  /**
   * content of dropdown button
   */
  children?: ReactNode;
  dropdownClassName?: string;
};

export function Dropdown({
  dropdownItems = [],
  label = "",
  triggerOn = "hover",
  placement = "bottomLeft",
  className = "",
  style = {},
  children,
  dropdownClassName
}: DropdownProps) {
  const menuItems = (
    <Menu>
      {dropdownItems.map((item, index) => {
        return (
          <Menu.Item key={item.id}>
            <div onClick={item.onClick}>{item.label}</div>
          </Menu.Item>
        );
      })}
    </Menu>
  );

  return (
    <AntDropdown
      className={classnames(dropdownClassName)}
      overlay={menuItems}
      placement={placement}
      trigger={[triggerOn]}
      overlayClassName={classnames(className, styles.dropdown)}
      align={{ overflow: { adjustX: true, adjustY: true } }}
    >
      {children ?? <Button>{label}</Button>}
    </AntDropdown>
  );
}

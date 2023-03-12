import { MouseEventHandler } from "react";
import { Menu, Dropdown as AntDropDown, Button } from "antd";
import { DownOutlined } from "@ant-design/icons";
import styles from "./dropdown.module.scss";
import { Label } from "../../../label";

/**
 *
 */
export type DropdownProps = {
  /**
   * placeholder text for input-box.
   */
  placeholder?: string;
  /**
   * pre rendered text
   */
  value?: string;
  /**
   * requried field check
   */
  requried?: boolean;
  /**
   * Customize class name
   */
  customizeClassName?: string;
  /**
   * On change method of input box
   */
  onChange: (value: string | number) => void;
  /**
   * name of the input box
   */
  name?: string;
  /**
   * is outer label
   */
  outerLabel?: boolean;
  /**
   * label text
   */
  labelText?: string;
  /**
   * is link with label
   */
  isLinkWithLabel?: boolean;
  /**
   * link text
   */
  linkText?: string;
  /**
   * labelClassName text
   */
  labelClassName?: string;
  /**
   * onclick of link button
   */
  onClickOfLink?: MouseEventHandler<HTMLElement>;
  /**
   * options Array<DropdownOption>
   */
  options: Array<DropdownOption>;
};

export type DropdownOption = {
  label: string;
  value: string | number;
};

export type DropdownOptionProps = {
  onChange: (value: string | number) => void;
  options: Array<DropdownOption>;
};

export default function Dropdown({
  value,
  placeholder = "Select",
  requried = false,
  customizeClassName,
  onChange,
  name,
  outerLabel = false,
  labelText = "",
  labelClassName = "",
  options = []
}: DropdownProps) {
  return (
    <div className={styles.inputBoxDiv + " " + customizeClassName}>
      {outerLabel ? (
        <div className={styles.inputBoxLabelDiv}>
          <Label customizeClassName={labelClassName} labelText={labelText} />
        </div>
      ) : null}
      <AntDropDown overlay={<DropDownOptions options={options} onChange={onChange} />}>
        <Button className={styles.dropdownButton}>
          {value || placeholder} <DownOutlined className={styles.dropDownIcon} />
        </Button>
      </AntDropDown>
    </div>
  );
}

function DropDownOptions(props: DropdownOptionProps) {
  return (
    <Menu>
      {props.options.map((e, i) => (
        <Menu.Item key={`key${i}`} onClick={() => props.onChange(e.value)} className={styles.menuOption}>
          {e.label}
        </Menu.Item>
      ))}
    </Menu>
  );
}

import React from "react";
import styles from "./Header.module.scss";

type DropdwonItemProps = {
  title: string;
  shortcut?: string;
};

const DropdownItem = ({ title, shortcut }: DropdwonItemProps) => {
  return (
    <div className={styles.dropdownItem}>
      <div>{title}</div>
      <div>{shortcut}</div>
    </div>
  );
};

export default DropdownItem;

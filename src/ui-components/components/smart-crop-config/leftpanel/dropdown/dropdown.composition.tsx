import React from "react";

//Import CSS
//@ts-ignore
import styles from "./button.module.scss";
import Dropdown, { DropdownProps } from "./dropdown";

/**
 *
 * @param props
 * @returns
 */
export const BasicDropDown = (props: DropdownProps) => <Dropdown {...props} />;

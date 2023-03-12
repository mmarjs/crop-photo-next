import classNames from "classnames";
import React from "react";
import { ComponentProp } from "../../../common/Types";
import styles from "./custom-card.module.scss";

export type CustomCardProps = ComponentProp & {
  title: string;
  content: string;
  footer?: string;
  bgColor?: string;
};

export const CustomCard = ({ title, content, footer, bgColor, className }: CustomCardProps) => (
  <div className={classNames(styles.Wrapper, className)} style={bgColor ? { backgroundColor: bgColor } : {}}>
    <h5>{title}</h5>
    <p>{content}</p>
    {footer && <span>{footer}</span>}
  </div>
);

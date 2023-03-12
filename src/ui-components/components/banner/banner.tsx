import React from "react";
import { Alert } from "antd";
import classNames from "classnames";
import styles from "./banner.module.scss";
import { ComponentProp } from "../../../common/Types";

export type BannerProps = ComponentProp & {
  message: string;
  description: string;
  closable?: boolean;
  onClose?: React.MouseEventHandler<HTMLButtonElement>;
};

export const Banner = ({ message, description, closable, className, onClose }: BannerProps) => {
  return (
    <div className={classNames(styles.Wrapper, className)}>
      <Alert action message={message} description={description} closable={closable} onClose={onClose} />
    </div>
  );
};

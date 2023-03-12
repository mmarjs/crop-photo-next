import React, { ReactNode } from "react";
import { Modal as AntModal } from "antd";
import { ComponentProp } from "../../../common/Types";

import styles from "./modal.module.scss";
import { LegacyButtonType } from "antd/lib/button/button";
import { Button } from "../button";

import IconClose from "../../assets/icons/icon-close.svg";
import { Direction } from "../../../common/Enums";
import classNames from "classnames";

export type ModalProps = ComponentProp & {
  title?: string | ReactNode;
  visible?: boolean;
  onOk?: React.MouseEventHandler<HTMLElement>;
  onCancel?: () => void;
  disableOk?: boolean;
  disableCancel?: boolean;
  okText?: string;
  cancelText?: string;
  type?: LegacyButtonType;
  confirmLoading?: boolean;
  width?: number;
  buttonLoading?: boolean;
  headerDirection?: Direction;
  noFooter?: boolean;
  danger?: boolean;
  formId?: string;
  closeIcon?: any;
  customStyles?: Object;
  okButtonProps?: Object;
};

export const Modal = ({
  title,
  visible,
  onOk,
  onCancel,
  okButtonProps,
  disableOk,
  disableCancel,
  children,
  okText,
  cancelText,
  type,
  confirmLoading,
  width,
  buttonLoading,
  headerDirection = Direction.VERTICAL,
  noFooter = false,
  danger = false,
  formId,
  closeIcon,
  customStyles
}: ModalProps) => {
  return (
    <AntModal
      title={title}
      open={visible}
      className={classNames(styles.Wrapper, {
        [styles.Horizontal]: headerDirection === Direction.HORIZONTAL
      })}
      style={customStyles}
      onCancel={onCancel}
      destroyOnClose
      closeIcon={
        <Button size="sm" className={styles.BtnClose} type="text" icon={closeIcon ? closeIcon : <IconClose />} />
      }
      okButtonProps={okButtonProps}
      footer={
        !noFooter && (
          <>
            <Button
              type={type === "danger" ? "primary" : type}
              danger={danger}
              onClick={onOk}
              label={okText}
              disabled={disableOk}
              loading={buttonLoading}
              formId={formId}
            />
            <Button type="text" onClick={onCancel} label={cancelText} disabled={disableCancel} />
          </>
        )
      }
      confirmLoading={confirmLoading}
      width={width}
    >
      {children}
    </AntModal>
  );
};

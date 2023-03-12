import React, { useEffect, useState } from "react";
import { Button } from "../button/index";
import { CustomModal } from "../modal/index";

export type CardModalProps = {
  /**
   *
   */
  buttonText: string;
  /**
   *
   */
  buttonClassname?: string;
  /**
   *
   */
  children: React.ReactElement;
  /**
   *
   */
  buttonLabelClassName?: string;
  /**
   *
   */
  okButtonText?: string;
  /**
   *
   */
  modalTitle?: string;
  width?: number;
  buttonType?: "link" | "text" | "default" | "primary" | "ghost" | "dashed";
  danger?: boolean;
  okButtonType?: "link" | "text" | "default" | "primary" | "ghost" | "dashed";
  onOkClickHandle?: (event: any) => Promise<void>;
  okLoading?: boolean;
  onButtonClick?: () => void;
  disabled?: boolean;
  disableOk?: boolean;
  buttonLoading?: boolean;
  isManualCloseModal?: boolean;
};

export default function CardModal({
  buttonText,
  buttonClassname,
  buttonLabelClassName,
  children,
  okButtonText,
  modalTitle,
  width,
  buttonType,
  danger = false,
  okButtonType,
  okLoading,
  onOkClickHandle,
  onButtonClick,
  disabled,
  disableOk,
  buttonLoading,
  isManualCloseModal
}: CardModalProps) {
  const [visible, setVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(true);

  useEffect(() => {
    if (isManualCloseModal) {
      setConfirmLoading(false);
      setVisible(false);
    }
  }, [isManualCloseModal]);

  const onClick = (e: React.MouseEvent<HTMLElement>) => {
    setVisible(true);
    if (onButtonClick) onButtonClick();
  };
  const handleOk = async (event: React.MouseEvent<HTMLElement>) => {
    setConfirmLoading(true);
    if (!!onOkClickHandle) {
      try {
        await onOkClickHandle(event);
        setConfirmLoading(false);
        setVisible(false);
      } catch (e: any) {
        console.log("handleOk error", e);
      }
    }
  };

  const handleCancel = () => {
    setVisible(false);
  };

  return (
    <>
      <Button
        type={buttonType ? buttonType : "primary"}
        label={buttonText}
        onClick={e => onClick(e)}
        className={buttonClassname}
        labelClassName={buttonLabelClassName ? buttonLabelClassName : undefined}
        disabled={disabled}
        loading={okLoading}
      />

      <CustomModal
        title={modalTitle}
        okText={okButtonText}
        cancelText="Cancel"
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        type={okButtonType ? okButtonType : "primary"}
        confirmLoading={confirmLoading || okLoading}
        width={width}
        danger={danger}
        disableOk={disableOk}
        buttonLoading={buttonLoading}
      >
        {children}
      </CustomModal>
    </>
  );
}

import { Radio } from "antd";
import React from "react";

export type RadioBtnProps = {
  /**
   * a text to be rendered in the component.
   */
  text?: string;
  checked: boolean;
  onChange?: any;
  value: any;
  labelNextLine?: boolean;
};

export function RadioBtn({ text, checked, value, onChange, labelNextLine = false }: RadioBtnProps) {
  return (
    <>
      <Radio value={value} onChange={onChange ? onChange : () => {}} checked={checked}>
        {!labelNextLine && text}
      </Radio>
      {labelNextLine && <div>{text}</div>}
    </>
  );
}

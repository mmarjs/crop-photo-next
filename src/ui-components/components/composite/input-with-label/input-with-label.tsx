import React, { ChangeEventHandler, useEffect } from "react";
import { HLayout } from "../../hLayout"; //'@evolphin/library.components.h-layout';
import { VLayout } from "../../vLayout"; //'@evolphin/library.components.v-layout';
import { Input } from "../../input"; //'@evolphin/library.components.input';
import { Label } from "../../label"; //'@evolphin/library.components.label';

import styles from "./input-with-label.module.scss";

export type InputWithLabelProps = {
  /**
   * pre rendered text if any.
   */
  text?: string;

  /**
   * a text for label component.
   */
  labelText: string;

  /**
   * label position "TOP"|"LEFT"
   */
  labelPosition?: string;

  /**
   * place holder text for text input box
   */
  placeHolderText?: string;
  /**
   * type of input box
   */
  inputType?: string;
  /**
   * INput box as mandatory field
   */
  inputAsMandatory?: boolean;
  /**
   * onChange of Input text value
   */
  OnChangeOfInputValue?: ChangeEventHandler<HTMLElement>;
  /**
   * onEnter key press of Input text value
   */
  onPressEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  focusOnEnd?: boolean;
};

export function InputWithLabel({
  text,
  labelText,
  labelPosition = "TOP",
  placeHolderText,
  inputType = "input",
  inputAsMandatory = false,
  OnChangeOfInputValue,
  onPressEnter,
  focusOnEnd = false
}: InputWithLabelProps) {
  let inputRef = React.useRef<any>(null);

  //Focus on Input
  useEffect(() => {
    if (focusOnEnd && inputRef && inputRef.current) {
      inputRef.current!.focus({
        cursor: "end"
      });
    }
  }, [inputRef]);

  return (
    <div className={styles.inputWithLabel}>
      {labelPosition === "LEFT" ? (
        <HLayout>
          <Label labelText={labelText} />
          <Input
            text={text}
            placeholder={placeHolderText}
            onChange={OnChangeOfInputValue}
            type={inputType}
            mandatory={inputAsMandatory}
            ref={focusOnEnd ? inputRef : null}
            onPressEnter={onPressEnter}
          />
        </HLayout>
      ) : (
        <VLayout style={{ marginLeft: "0px" }}>
          <Label labelText={labelText} customizeClassName={styles.newNameLabel} />
          <Input
            text={text}
            placeholder={placeHolderText}
            onChange={OnChangeOfInputValue}
            type={inputType}
            mandatory={inputAsMandatory}
            ref={focusOnEnd ? inputRef : null}
            onPressEnter={onPressEnter}
          />
        </VLayout>
      )}
    </div>
  );
}

import React from "react";
import { Button } from "../button";

import styles from "./vertical-button-bar.module.scss";

/**
 *
 */
export type VerticalBarButtonProps = {
  /**
   * label for the button
   */
  label: string;

  /**
   *
   */
  icon?: React.ReactElement;

  /**
   * type for the button
   */
  id: string;
};

/**
 *
 */
export type VerticalButtonBarProps = {
  /**
   * btnArr
   */
  buttonArr: Array<VerticalBarButtonProps>;

  /**
   *
   */
  onVerticalButtonClick: (id: string) => void;
};

/**
 *
 * @param param0
 * @returns
 */
export function VerticalButtonBar({ buttonArr, onVerticalButtonClick }: VerticalButtonBarProps) {
  return (
    <>
      {buttonArr.map(vBarButton => (
        <Button
          key={vBarButton.id}
          label={vBarButton.label}
          icon={vBarButton.icon}
          className={styles.vButton}
          onClick={() => {
            onVerticalButtonClick(vBarButton.id);
          }}
        />
      ))}
    </>
  );
}

import React, { MouseEventHandler, ReactNode } from "react";
import styles from "./card.module.scss";

/**
 *
 */
export type CardProps = {
  hoverable: boolean;
  children?: ReactNode;
  classNames: any;
  image: string;
  coverClass: string;
  onClick: MouseEventHandler;
  bg: string;
};
export function Card({ onClick, hoverable, classNames, children, image, coverClass, bg }: CardProps) {
  return (
    <div className={styles.warpper} onClick={onClick}>
      <div className={styles.overlapgroup1} style={{ backgroundImage: `url(${image})`, backgroundSize: "contain" }}>
        <img className={styles.union} src={bg} />
      </div>
      {children}
    </div>
  );
}

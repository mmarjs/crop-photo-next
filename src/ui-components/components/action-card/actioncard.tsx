import React from "react";
import styles from "./action.module.scss";
import { Label } from "../label";
import { Icon } from "../icon";
import { CustomIconComponentProps } from "@ant-design/icons/lib/components/Icon";

export type ActionCardProps = {
  /**
   * Title of the action card
   */
  title: string;
  /**
   * description of the action card
   */
  description: string;
  /**
   * Icon/svg file
   */
  icon: string;
  /**
   * Function that calls on click of the action card
   */
  onClick?: () => void;
};

export function ActionCard({ title, description, icon, onClick }: ActionCardProps) {
  return (
    <div className={styles.actionCardContainer} onClick={onClick}>
      <div className={styles.actionCardIcon}>
        <img src={icon} className={styles.icon} />
      </div>
      <div className={styles.actionCardText}>
        <Label labelText={title} customizeClassName={styles.title} />
        <Label labelText={description} customizeClassName={styles.description} />
      </div>
    </div>
  );
}

import { Skeleton } from "antd";
import React from "react";
import { Tooltip } from "../../../../ui-components/components/tooltip";
import styles from "./statsCard.module.scss";

interface StatsCard {
  icon: React.ReactNode;
  title: string;
  summaryBy?: string;
  value: number | string;
  isLoading: boolean;
}

const StatsCard = ({ icon, title, summaryBy, value, isLoading }: StatsCard) => {
  return (
    <div className={styles.statsCard}>
      <div className={styles.bottomWrapper}>
        <div className={styles.icon}>{icon}</div>

        <div className={styles.bottomRight}>
          {isLoading ? (
            <Skeleton.Button active />
          ) : value > 1000 ? (
            <Tooltip title={value} placement="top">
              {value}
            </Tooltip>
          ) : (
            value
          )}
        </div>
      </div>
      <div className={styles.bottomLeft}>
        <div className={styles.title}>{title}</div>
        {/* <div className={styles.summaryBy}>
            {summaryBy}
          </div> */}
      </div>
    </div>
  );
};

export default StatsCard;

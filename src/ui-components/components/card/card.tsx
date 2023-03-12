import React, { ReactChild, ReactNode } from "react";
import CardInfo from "/public/images/card-info.svg";
//Import CSS
import classnames from "classnames";
//@ts-ignore
import styles from "./card.module.scss";
import { Header } from "../header";
import { useTranslation } from "react-i18next";
import { Tooltip } from "../tooltip";
import { OpenInAppHelp } from "../icon/icon.composition";
export type CardProps = {
  /**
   * unique Id for keys
   */
  id: string;
  /**
   *
   */
  className?: string;
  /**
   * Icon's path as string'
   */
  icon: string;
  /**
   * Title of the card
   */
  title: string;
  /**
   * description or the sub-title of the card
   */
  description?: string;
  /**
   * Custom Styles.
   */
  style?: Object;
  /**
   * Custom Styles.
   */
  disabled?: Boolean;
  /**
   * onClick function.
   */
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  /**
   * to display the new tag.
   */
  comingSoonBadge?: boolean;
  newBadge?: boolean;
  article?: string | number | undefined;
};

/**
 *
 * @param param0
 * @returns
 */
export function Card({
  className,
  icon = " ",
  title = " ",
  description = " ",
  disabled = false,
  onClick,
  comingSoonBadge = false,
  newBadge = false,
  article
}: CardProps) {
  const { t } = useTranslation();
  return (
    <div className={classnames(styles.card, className, disabled ? styles.disabled : "")} onClick={onClick}>
      <div className={styles.iconBadgeWrapper}>
        <div className={styles.cardIconContainer}>
          <img src={icon} />
        </div>
        <div className={styles.icons}>
          {comingSoonBadge && <div className={styles.comingSoonBadge}>{t("home.coming_soon")}</div>}
          {newBadge && <div className={styles.newBadge}>{t("home.new")}</div>}
        </div>
      </div>
      {/* <Header
        className={styles.cardHeaderContainer}
        headerClass={styles.cardHeader}
        subHeaderClass={styles.cardDescription}
        text={title}
        subText={description}
      /> */}
      <div className={styles.cardDescWrapper}>
        <div style={{ width: "100%" }}>
          <div className={styles.cardTitle}>{title}</div>
          {description && <div className={styles.cardDescription}>{description}</div>}
        </div>
        {article && (
          <div onClick={e => e.stopPropagation()}>
            <OpenInAppHelp dark={false} article={article} />
          </div>
        )}
      </div>
    </div>
  );
}

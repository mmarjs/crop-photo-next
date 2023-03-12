import styles from "./contentCard.module.scss";

export type ContentCardProps = {
  /**
   * title
   */
  title: string;
  /**
   * description
   */
  description?: string;
  /**
   * icon for content card
   */
  icon?: string;
  /**
   *
   */
  children?: React.ReactNode;
};

export function ContentCard({ title, description, icon, children }: ContentCardProps) {
  return (
    <div className={styles.contentCardContainer}>
      <div>
        <img src={icon} className={styles.iconColor} />
        <div className={styles.title}>
          <span>{title}</span>
        </div>
        <p className={styles.description}>
          <span>{description}</span>
        </p>
      </div>
      {children ? children : null}
    </div>
  );
}

import classnames from "classnames";
import styles from "./startAutomation.module.scss";
import { Header } from "../../components/header";
import { Card, CardProps } from "../../components/card";
import { OpenInAppHelp } from "../../components/icon/icon.composition";
import { ARTICLE_URL_ID } from "../../../common/Enums";

export type StartAutomationProps = {
  /**
   * array of option to show
   */
  automationOptions: Array<CardProps>;
  /**
   * heading for the panel
   */
  heading: string;
  /**
   * style fo inline CSS
   */
  style?: Object;
  /**
   * classname to override CSS
   */
  className?: string;
};

export function StartAutomation({ automationOptions = [], heading, style, className }: StartAutomationProps) {
  return (
    <div className={classnames(className, styles.startAutomation)}>
      <div className={styles.headerWrapper}>
        <Header className={styles.headingContainer} headerClass={styles.cropHeading} text={heading} />
        <OpenInAppHelp article={ARTICLE_URL_ID.START_AUTOMATION} />
      </div>

      <div className={styles.cropList}>
        {automationOptions.map(item => {
          return (
            <Card
              id={item.id}
              key={item.id}
              icon={item.icon}
              title={item.title}
              description={item.description}
              disabled={item.disabled}
              onClick={item.onClick}
              comingSoonBadge={item.comingSoonBadge}
              newBadge={item.newBadge}
              article={item.article}
            />
          );
        })}
      </div>
    </div>
  );
}

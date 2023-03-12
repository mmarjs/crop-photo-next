import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { ListingScoreCategory, Marketplace } from "../../main-report/ListingScoreDetails/ListingScoreDetails";
import styles from "./score-card.module.scss";

interface ScoreCardProps {
  category?: ListingScoreCategory;
  marketplace?: Marketplace;
}

export default function ScoreCard({ marketplace, category }: ScoreCardProps) {
  const { t } = useTranslation();

  return (
    <div
      className={classNames(styles.ScoreCard, {
        [styles.ScoreCard_shadow]: !!marketplace,
        [styles.ScoreCard_muted]: category?.score === 100
      })}
    >
      {!!marketplace ? (
        <div className={styles.mainScoreCardContainer}>
          {" "}
          <div className={styles.mainScoreCard_Left}>
            <div className={styles.scoreCardLogoContainer}>
              <img src={marketplace?.logo || "#"} alt="#" className={styles.scoredCardLogo} />
            </div>
            <div className={styles.scoreCardHeader}>
              <h2 className={styles.scoreCardHeaderTitle}>{marketplace?.marketplace}</h2>
              <p className={styles.scoreCardHeaderSubtitle}>{marketplace?.sub_label}</p>
            </div>
          </div>
          <div className={styles.mainScoreCard_Right}>
            <div
              className={classNames(styles.scoreCardPercentage, {
                [styles.scoreCardPercentage_bold]: !!marketplace
              })}
            >
              <p className={styles.ratingPercentText}>{marketplace?.overall_score || 0}%</p>
            </div>
            <div className={styles.scoreCardFooter}>
              {marketplace?.overall_score === 100 ? (
                <p className={styles.scoreCardFooterMutedText}>{t("main_report.score_card.no_improvements")}</p>
              ) : (
                <p className={styles.scoreCardFooterText}>
                  <span
                    className={classNames({
                      [styles.increaseRate]:
                        !!marketplace?.overall_score_change && marketplace?.overall_score_change > 0,
                      [styles.decreaseRate]: !!marketplace.overall_score_change && marketplace.overall_score_change < 0
                    })}
                  >
                    {marketplace?.overall_score_change || 0}%{" "}
                  </span>
                  <span>{t("main_report.score_card.after_crop")}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.scoreCardLogoContainer}>
            <img src={category?.logo || "#"} alt="#" className={styles.scoredCardLogo} />
          </div>
          <div className={styles.scoreCardHeader}>
            <h2 className={styles.scoreCardHeaderTitle}>{category?.category_label}</h2>
            <p className={styles.scoreCardHeaderSubtitle}>{category?.sub_label}</p>
          </div>
          <div
            className={classNames(styles.scoreCardPercentage, {
              [styles.scoreCardPercentage_bold]: !!marketplace
            })}
          >
            <p className={styles.ratingPercentText}>{category?.score || 0}%</p>
          </div>
          <div className={styles.scoreCardFooter}>
            {category?.score === 100 ? (
              <p className={styles.scoreCardFooterMutedText}>{t("main_report.score_card.no_improvements")}</p>
            ) : (
              <p className={styles.scoreCardFooterText}>
                <span
                  className={classNames({
                    [styles.increaseRate]: !!category?.score_change && category.score_change > 0,
                    [styles.decreaseRate]: !!category?.score_change && category.score_change < 0
                  })}
                >
                  {category?.score_change || 0}%{" "}
                </span>
                <span>{t("main_report.score_card.after_crop")}</span>
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

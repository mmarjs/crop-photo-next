import classNames from "classnames";
import { useMemo } from "react";
import Popover from "antd/lib/popover";
import { useTranslation } from "react-i18next";
import { OBJECT_TYPE } from "../../../common/Types";
import { ListingRecommendations, ListingScoreIssuesItem } from "./ListingScoreDetails";
import styles from "./ListingScoreDetails.module.scss";
import { VariantList } from "../OverviewCard/OverviewCard";
import { useRouter } from "next/router";

export default function ImprovementBreakdownCards({
  issuesCount,
  issues,
  increaseRate,
  recommended_changes,
  listing_recommendations,
  imageURLs,
  marketplace,
  onScrollIntoView
}: {
  imageURLs: OBJECT_TYPE;
  issuesCount: number;
  increaseRate: number;
  issues: ListingScoreIssuesItem[];
  recommended_changes: ListingScoreIssuesItem[];
  listing_recommendations: ListingRecommendations | undefined;
  marketplace: string;
  onScrollIntoView: Function;
}) {
  const router = useRouter();
  const showListing = router?.query?.showListing;
  return (
    <div className={styles.improveBreakdownCards}>
      <ImprovementDescriptionCard
        issuesCount={issuesCount}
        increaseRate={increaseRate}
        critical_issues={issues}
        recommended_changes={recommended_changes}
        onScrollIntoView={onScrollIntoView}
      />
      {showListing ? (
        <ImprovementRequirementsCard
          marketplace={marketplace}
          listingRecommendations={listing_recommendations}
          imageURLs={imageURLs}
        />
      ) : null}
    </div>
  );
}

function ImprovementDescriptionCard({
  issuesCount,
  increaseRate,
  critical_issues,
  recommended_changes,
  onScrollIntoView
}: {
  issuesCount: number;
  increaseRate: number;
  critical_issues: ListingScoreIssuesItem[];
  recommended_changes: ListingScoreIssuesItem[];
  onScrollIntoView: Function;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const showListing = router?.query?.showListing;

  const isEmptyListing = recommended_changes?.length === 0 && critical_issues?.length === 0;
  return (
    <div
      className={classNames(styles.improvementDescriptionCard, {
        [styles.emptyCard]: isEmptyListing,
        [styles.emptyRecommendation]: recommended_changes?.length === 0,
        [styles.emptyIssues]: critical_issues?.length === 0
      })}
    >
      <div className={styles.improvementDescriptionCardHeader}>
        {isEmptyListing ? (
          <h3 className={styles.successDescriptionTitle}>
            <span className={styles.successText}>Success!</span> <span>No issues identified</span>
          </h3>
        ) : (
          <h3 className={styles.improvementDescriptionTitle}>
            <span>{t("main_report.improve_score.desc")} </span>
            <span className={styles.issuesText}>
              {t("main_report.improve_score.desc_issues", {
                issues_count: issuesCount
              })}
              .{" "}
            </span>{" "}
            <span>{t("main_report.improve_score.desc_cont")} </span>
            <span className={styles.listingIncreaseRate}>{increaseRate}%</span>
          </h3>
        )}
      </div>
      <div
        className={classNames(styles.improvementDescriptionContent, {
          [styles.showListingCard]: showListing,
          [styles.emptyListing]: isEmptyListing
        })}
      >
        {isEmptyListing ? (
          <div className={styles.successListingContainer}>
            <img
              src="/images/success-listing.svg"
              width="124"
              height="124"
              alt="success"
              className={styles.successListingImage}
            />
          </div>
        ) : null}
        {!isEmptyListing && critical_issues?.length > 0 ? (
          <div className={classNames(styles.criticalIssues, styles.listingContent)}>
            <h3 className={styles.improvementDescriptionCardTitle}>
              <img src="/images/critical.svg" alt="#" width={24} height={24} />
              <span>{t("main_report.improve_score.critical_issues")}</span>
            </h3>
            <div className={classNames(styles.criticalIssuesList, styles.improvementList)}>
              {critical_issues?.length > 0 ? (
                <>
                  {critical_issues.map((issue: ListingScoreIssuesItem) => {
                    return (
                      <p key={issue.id} className={styles.improvementListItem}>
                        {issue.label}
                      </p>
                    );
                  })}
                </>
              ) : null}
            </div>
          </div>
        ) : null}
        {!isEmptyListing && recommended_changes?.length > 0 ? (
          <div className={classNames(styles.recommendedChanges, styles.listingContent)}>
            <h3 className={styles.improvementDescriptionCardTitle}>
              {" "}
              <img src="/images/warning.svg" alt="#" width={24} height={24} />
              <span>{t("main_report.improve_score.recommended_changes")}</span>
            </h3>
            <div className={classNames(styles.recommendedChangesList, styles.improvementList)}>
              {recommended_changes?.length > 0 ? (
                <>
                  {recommended_changes.map((change: ListingScoreIssuesItem) => {
                    return (
                      <p key={change.id} className={styles.improvementListItem}>
                        {change.label}
                      </p>
                    );
                  })}
                </>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
      <div className={styles.viewDetailedReportLink}>
        <p onClick={() => onScrollIntoView()}>{isEmptyListing ? "View Success Report" : "View Detailed Report"}</p>
      </div>
    </div>
  );
}

function ImprovementRequirementsCard({
  listingRecommendations,
  imageURLs,
  marketplace
}: {
  listingRecommendations: ListingRecommendations | undefined;
  imageURLs: OBJECT_TYPE;
  marketplace: string;
}) {
  const { t } = useTranslation();
  const variants = useMemo(() => {
    if (!!listingRecommendations && listingRecommendations?.listing_examples?.length > 0) {
      return listingRecommendations.listing_examples.images.map(id => {
        return {
          imageUrl: imageURLs[id],
          id
        };
      });
    }
  }, [listingRecommendations]);

  return (
    <div className={styles.improvementRequirementsCard}>
      <div className={styles.improvementRequirementsCardHeader}>
        <img src="/images/not_recommended.svg" alt="#" width={40} height={40} />
        <p
          className={styles.improvementRequirementsCardCategory}
        >{`${listingRecommendations?.category_label}: ${listingRecommendations?.sub_category_label}`}</p>
      </div>

      <div className={styles.improvementRequirementsContent}>
        <div className={styles.improvementRequirementsHeader}>
          <h2 className={styles.improvementRequirementsTitle}>
            <span className={styles.successText}>{t("main_report.improve_score.success")} </span>
            <span>{t("main_report.improve_score.match")} </span>
            <Popover title={null} placement="bottomLeft" content={<MeetingRequirementsPopup />}>
              <img src="/images/tooltip.svg" width={14} />
            </Popover>
          </h2>

          <p className={styles.improvementRequirementsDesc}>
            <span style={{ fontWeight: 600, textTransform: "capitalize" }}>
              {t("main_report.improve_score.marketplace", {
                marketplace: marketplace || ""
              })}
            </span>{" "}
            <span>{t("main_report.improve_score.recommend")}</span>{" "}
            <span style={{ fontWeight: 600 }}>
              {t("main_report.improve_score.photos_count", {
                count: listingRecommendations?.listing_examples?.length || 0
              })}
            </span>{" "}
            <span>{t("main_report.improve_score.cont")}</span>
          </p>
        </div>
        <div className={styles.listingExample}>
          <h2>{t("main_report.improve_score.listing_example")}</h2>
          <VariantList list={variants || []} listing />
        </div>
      </div>
    </div>
  );
}

function MeetingRequirementsPopup() {
  return (
    <div className={styles.meetingRequirementsPopup}>
      <h2>Meeting Requirements</h2>
      <p>Here are some tips for your photos to meet the marketplace requirements.</p>
      <div className={styles.popupLinks}>
        <h3>
          <img src="/images/newspaper.svg" alt="newspaper" width={12} />
          <span>Related Articles</span>
        </h3>
        <p>learn more about dimensions</p>
        <p>minimum image size</p>
        <p>brand on image</p>
      </div>
    </div>
  );
}

import { useTranslation } from "react-i18next";
import ScoreCard from "../../components/score-card";
import { Button } from "../../components/button";
import { useMemo } from "react";
import { OBJECT_TYPE } from "../../../common/Types";
import ImprovementBreakdownCards from "./ImproveBreakdownCards";
import styles from "./ListingScoreDetails.module.scss";
import { categoryScoreCards } from "./categoryScores";
import { Tooltip } from "antd";

export enum Cards {
  photography = "photography",
  dimensions = "dimensions",
  policies = "policies",
  data = "data_and_category",
  amazon = "amazon",
  etsy = "etsy",
  ali = "aliexpress",
  global = "listing_global_issues"
}

export const getCardIcon = (id: string): string | null => {
  switch (id) {
    case Cards.photography:
      return "/images/picture.svg";
    case Cards.dimensions:
      return "/images/dimension.svg";
    case Cards.policies:
      return "/images/policies.svg";
    case Cards.data:
      return "/images/data.svg";
    case Cards.amazon:
      return "/images/amazon_round.svg";
    case Cards.etsy:
      return "/images/etsy.svg";
    case Cards.ali:
      return "/images/ali.svg";
    case Cards.global:
      return "/images/amazon_round.svg";
    default:
      return null;
  }
};

export type ListingScoreCategory = {
  category_id: string;
  category_label: string;
  score: number;
  score_change: number;
  logo?: string | null;
  sub_label: string;
};

export type ListingScoreIssuesItem = {
  id: string;
  label: string;
};

export type ListingScoreIssues = {
  count: number;
  improving_score: number;
  critical_issues: ListingScoreIssuesItem[];
  recommended_changes: ListingScoreIssuesItem[];
};

export type Marketplace = {
  marketplace: string;
  overall_score: number;
  overall_score_change: number;
  sub_label?: string;
  logo?: string | null;
};

export type ListingRecommendations = {
  category_label: string;
  listing_examples: {
    length: number;
    images: string[];
  };
  sub_category_label: string;
};

type ListingScore = {
  categories: ListingScoreCategory[];
  issues: ListingScoreIssues;
  marketplace: string;
  overall_score: number;
  overall_score_change: number;
  recommendations: ListingRecommendations;
  sub_label: string;
};

interface ListingScoreProps {
  data: ListingScore | undefined;
  imageURLs: OBJECT_TYPE;
  onScrollIntoView: () => void;
}

export default function ListingScoreDetails({ data, imageURLs, onScrollIntoView }: ListingScoreProps) {
  const { t } = useTranslation();

  const scores = useMemo(() => {
    if (!!data && data?.categories.length > 0) {
      return data?.categories.map((category: ListingScoreCategory) => {
        return {
          ...category,
          score: category.score,
          score_change: category.score_change,
          logo: getCardIcon(category?.category_id),
          sub_label: category?.sub_label
        };
      });
    }
  }, [data?.categories]);

  const marketplace = useMemo(() => {
    if (!!data && data?.marketplace) {
      return {
        marketplace: data?.marketplace,
        logo: getCardIcon(data?.marketplace),
        sub_label: data?.sub_label,
        overall_score: data?.overall_score,
        overall_score_change: data?.overall_score_change
      };
    }
  }, [data]);

  return (
    <div className={styles.listingScoreContainer}>
      <div className={styles.listingScoreHeader}>
        <div>
          <h2 className={styles.listingScoreHeaderTitle}>
            <span>{t("main_report.listing_score.title")}</span>
            <Tooltip title={t("main_report.current_score.tooltip")}>
              <img src="/images/tooltip-muted.svg" width={18} className={styles.titleTooltip} />
            </Tooltip>
          </h2>
          <p>
            <span className={styles.cropPhoto}>{t("main_report.listing_score.crop_photo")}</span>{" "}
            <span>{t("main_report.listing_score.desc")}</span>
          </p>
        </div>
        <Button
          type="primary"
          icon={<img src="/images/arrow_down_white.svg" alt="arrow down" width={14} height={16} />}
          label={t("main_report.detailed_report.title")}
          className={styles.listingScoreButton}
          onClick={onScrollIntoView}
        />
      </div>
      <div className={styles.listingScoreCards}>
        <ScoreCard marketplace={marketplace} />
        {!!scores && scores.map(score => <ScoreCard category={score} key={score?.category_id} />)}
      </div>
      <div className={styles.openDesktopReminder}>
        <h4 className={styles.openDesktopReminderText}>
          <span>{t("main_report.desktop_reminder.open")}</span>
          <span className={styles.gradientText}>Crop.Photo </span>
          <span>{t("main_report.desktop_reminder.open_cont")}</span>
        </h4>
      </div>
      <ImprovementBreakdownCards
        issuesCount={data?.issues?.count || 0}
        issues={data?.issues?.critical_issues || []}
        recommended_changes={data?.issues?.recommended_changes || []}
        increaseRate={data?.issues?.improving_score || 0}
        listing_recommendations={data?.recommendations}
        imageURLs={imageURLs}
        marketplace={data?.marketplace as string}
        onScrollIntoView={onScrollIntoView}
      />
    </div>
  );
}

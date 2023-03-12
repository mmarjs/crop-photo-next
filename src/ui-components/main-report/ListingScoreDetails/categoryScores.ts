import { Cards } from "./ListingScoreDetails";

export interface CategoryScore {
  name: "Dimension";
  id: "dimensions";
}

export const categoryScoreCards = [
  {
    category_id: "photography",
    category_label: "Photography",
    score: 100,
    score_change: 0,
    logo: "/images/photography-muted.svg",
    sub_label: "main_report.score_card.max_score"
  },
  {
    category_id: "dimensions",
    category_label: "Dimension",
    score: 100,
    score_change: 0,
    logo: "/images/dimensions-muted.svg",
    sub_label: "main_report.score_card.max_score"
  },
  {
    category_id: "policies",
    category_label: "Policies",
    score: 100,
    score_change: 0,
    logo: "/images/policies-muted.svg",
    sub_label: "main_report.score_card.max_score"
  },
  {
    category_id: "data",
    category_label: "Data and Category",
    score: 100,
    score_change: 0,
    logo: "/images/data-muted.svg",
    sub_label: "main_report.score_card.max_score"
  }
];

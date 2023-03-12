import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import Hero from "./Hero/Hero";
import ListingScoreDetails from "./ListingScoreDetails/ListingScoreDetails";
import DetailedReport from "./DetailedReport";
import DetailedReportAccordions from "./DetailedReportAccordions";
import Footer from "./Footer";
import BackTop from "antd/lib/back-top";
import API from "../../util/web/api";

import styles from "../../styles/MainReport.module.scss";
import OverviewCard from "./OverviewCard";
// import FixItToolWaitlist from "./FixItToolWaitlist";
import classNames from "classnames";
import { ScorePanel } from "./ScoreByImage/ScoreByImage";
import updateIntercomPosition from "../../hooks/updateIntercomPosition";
import NavigationHeader from "./Header/NavigationHeader";
import { orderBy } from "lodash";
// import MainHighlights from "./MainHighlights";

//styles for back to top icon
const style: React.CSSProperties = {
  height: 40,
  width: 40,
  borderRadius: 80,
  backgroundColor: "#0038FF",
  color: "#fff",
  textAlign: "center",
  boxShadow: "0px 8px 8px -4px rgba(90, 117, 150, 0.2)",
  display: "grid",
  placeItems: "center"
};

export type ReportTabDetail = {
  description: string;
  how_to?: string;
  potential_score: number;
  rule_id: string;
  rule_label: string;
};

export type ReportTabDetails = {
  issue_id: string;
  issue_label: string;
  details: ReportTabDetail[];
};

export type CategoryDetail = {
  category_id: string;
  category_label: string;
  score_change: string;
  actual_score: number;
  tab_details: ReportTabDetails[];
};

export type ReportDetail = {
  data: CategoryDetail[];
  image_id: string;
  count: number;
};

export default function MainReport() {
  const router = useRouter();
  const showJoinWaitlist = router?.query?.showJoinWaitlist;
  const { jobId, errorCode } = router?.query;
  const { data: jobResult, isLoading } = useQuery(
    ["qcJobResult", jobId as string],
    () => API.getQCJobResult(jobId as string),
    {
      enabled: !!jobId
    }
  );
  updateIntercomPosition(30, !isLoading);

  const imageURLs = jobResult?.data?.image_id_to_url;
  const overview = jobResult?.data?.overview;
  const listingScore = jobResult?.data?.listing_score;
  const detailedReport = jobResult?.data?.detailed_report;
  const scoresByImage = orderBy(jobResult?.data?.score_by_image, ["image_id", "asc"]);
  const detailedReportAccordionsRef = useRef<HTMLDivElement>();
  const detailedReportHeaderRef = useRef<HTMLDivElement>();

  const [selectedReport, setSelectedReport] = useState<ReportDetail | undefined>(undefined);
  const [hasNextReport, setHasNextReport] = useState(true);
  const [hasPrevReport, setHasPrevReport] = useState(false);
  const [selectedImageScore, setSelectedImageScore] = useState<undefined | ScorePanel>(undefined);

  const sortedDetailedReports = useMemo(() => {
    if (!!detailedReport) {
      return orderBy(detailedReport, ["image_id", "asc"]);
    }
    return [];
  }, [detailedReport]);

  const sortedScoresByImages = useMemo(() => {
    if (!!scoresByImage) {
      return orderBy(scoresByImage, ["image_id", "asc"]);
    }
    return [];
  }, [scoresByImage]);

  useEffect(() => {
    if (!!sortedDetailedReports && sortedDetailedReports.length > 0) {
      setSelectedReport(sortedDetailedReports[0]);
    }
  }, [sortedDetailedReports]);

  useEffect(() => {
    if (!!sortedScoresByImages && sortedScoresByImages.length > 0 && !selectedImageScore) {
      setSelectedImageScore(sortedScoresByImages[0]);
    }
  }, [sortedScoresByImages, selectedImageScore]);

  const variantImages = useMemo(() => {
    if (!imageURLs || !overview) return [];

    const variants = overview.images.variant_ids.map((variantId: string) => ({
      imageUrl: imageURLs[variantId],
      id: variantId
    }));
    const mainImage = {
      imageUrl: imageURLs[overview.images.main_id],
      id: overview.images.main_id
    };
    const listingImage = {
      imageUrl: "/image/amazon_round.svg",
      id: "listing"
    };
    return [listingImage, mainImage, ...variants];
  }, [imageURLs, overview]);

  const handleSelectReportDetail = useCallback(
    (id: string) => {
      const report = sortedDetailedReports?.find((report: ReportDetail) => report?.image_id === id);
      const imageScore = sortedScoresByImages?.find((score: ScorePanel) => score?.image_id === id);
      if (!!report) {
        const currentIndex = sortedDetailedReports.findIndex((r: any) => r.image_id === report?.image_id);
        setHasNextReport(currentIndex + 1 <= sortedDetailedReports.length - 1);
        setHasPrevReport(currentIndex - 1 >= 0);
        setSelectedReport(report);
      }
      if (!!imageScore) {
        setSelectedImageScore(imageScore);
      }
    },
    [sortedDetailedReports, sortedScoresByImages]
  );

  const handleScrollIntoAccordions = () => {
    if (detailedReportHeaderRef?.current) {
      detailedReportHeaderRef?.current.scrollIntoView({
        behavior: "smooth"
      });
    }
  };

  const handleSelectNextReport = useCallback(() => {
    const currentIndex = sortedDetailedReports.findIndex((report: any) => report.image_id === selectedReport?.image_id);
    const nextIndex = currentIndex + 1;

    if (nextIndex <= sortedDetailedReports.length - 1) {
      const nextReport = sortedDetailedReports[nextIndex];
      const imageScore = sortedScoresByImages?.find((score: ScorePanel) => score?.image_id === nextReport.image_id);
      setSelectedReport(nextReport);
      if (!!imageScore) {
        setSelectedImageScore(imageScore);
      }
    }
    setHasNextReport(nextIndex !== sortedDetailedReports.length - 1);
    setHasPrevReport(true);
  }, [sortedDetailedReports, sortedScoresByImages]);

  const handleSelectPreviousReport = useCallback(() => {
    const currentIndex = sortedDetailedReports.findIndex((report: any) => report.image_id === selectedReport?.image_id);
    const previousIndex = currentIndex - 1;
    if (previousIndex >= 0) {
      const prevReport = sortedDetailedReports[previousIndex];
      const imageScore = sortedScoresByImages?.find((score: ScorePanel) => score?.image_id === prevReport.image_id);
      setSelectedReport(prevReport);
      if (!!imageScore) {
        setSelectedImageScore(imageScore);
      }
    }
    setHasNextReport(true);
    setHasPrevReport(previousIndex !== 0);
  }, [sortedDetailedReports, sortedScoresByImages]);

  return (
    <>
      <main className={styles.MainReport} id="mainContainer">
        <NavigationHeader scrollTo={handleScrollIntoAccordions} showButtons />
        <div
          className={classNames(styles.HeroToListingWrapper, {
            [styles.showJoinWaitlist]: showJoinWaitlist,
            [styles.errorContainer]: !!errorCode
          })}
        >
          <div className={styles.innerContainer}>
            <Hero />
            {!errorCode ? (
              <>
                <OverviewCard overview={overview} imageURLs={imageURLs} isLoading={isLoading} />
                <ListingScoreDetails
                  data={listingScore}
                  imageURLs={imageURLs}
                  onScrollIntoView={handleScrollIntoAccordions}
                />
                {/* <MainHighlights onScrollIntoView={handleScrollIntoAccordions} /> */}
              </>
            ) : null}
          </div>
        </div>
        {!errorCode ? (
          <div className={styles.DetailedReportWrapper}>
            <div className={styles.innerContainer}>
              {/* @ts-ignore */}
              <div ref={detailedReportHeaderRef}>
                <DetailedReport
                  variants={variantImages}
                  onSelectReport={handleSelectReportDetail}
                  selectedId={selectedReport?.image_id}
                  onSelectNextReport={handleSelectNextReport}
                  onSelectPreviousReport={handleSelectPreviousReport}
                  hasNext={hasNextReport}
                  hasPrevious={hasPrevReport}
                />
              </div>
              {/* @ts-ignore */}
              <div ref={detailedReportAccordionsRef}>
                <DetailedReportAccordions
                  report={selectedReport}
                  onSelectNextReport={handleSelectNextReport}
                  onSelectPreviousReport={handleSelectPreviousReport}
                  hasNext={hasNextReport}
                  hasPrevious={hasPrevReport}
                  imageScore={selectedImageScore}
                />
              </div>
            </div>
            <Footer />
          </div>
        ) : null}
      </main>

      <BackTop
        //@ts-ignore
        target={() => document.getElementById("mainContainer")}
        style={{ right: 30, bottom: 110, zIndex: 200 }}
      >
        <div style={style}>
          <img src="/images/back_top.svg" alt="back_top" width={24} />
        </div>
      </BackTop>
    </>
  );
}

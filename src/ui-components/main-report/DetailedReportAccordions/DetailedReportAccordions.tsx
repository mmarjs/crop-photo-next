import { Collapse, Tabs, Grid } from "antd";
import classNames from "classnames";
import { useRouter } from "next/router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../components/button";
import { getCardIcon } from "../ListingScoreDetails/ListingScoreDetails";
import { CategoryDetail, ReportDetail, ReportTabDetail, ReportTabDetails } from "../MainReport";
import { ScorePanel } from "../ScoreByImage/ScoreByImage";

import styles from "./DetailedReportAccordions.module.scss";

const { Panel } = Collapse;
const { TabPane } = Tabs;
const { useBreakpoint } = Grid;

interface DetailedReportAccordionsProps {
  report: ReportDetail | undefined;
  onSelectNextReport: () => void;
  onSelectPreviousReport: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
  imageScore: ScorePanel | undefined;
}

export default function DetailedReportAccordions({
  report,
  onSelectNextReport,
  onSelectPreviousReport,
  hasNext,
  hasPrevious,
  imageScore
}: DetailedReportAccordionsProps) {
  const screens = useBreakpoint();
  const { t } = useTranslation();
  const router = useRouter();
  const { expanded, jobId } = router?.query;
  const [activeKeys, setActiveKeys] = useState<string | string[]>([]);
  const handlePanelChange = (key: string | string[]) => {
    setActiveKeys(key);
  };
  const handlePanelTabChange = (activeKey: string) => {};

  return (
    <div className={styles.DetailedReportAccordions}>
      {report?.image_id !== "listing" ? (
        <div className={styles.mainImageCard}>
          <div className={styles.mainImageCardLeft}>
            <h2 className={styles.totalScoreTitle}>
              <span className={styles.mainImageText}>
                {imageScore?.image_id === "main"
                  ? t("main_report.detailed_report_accordions.main_image.title1")
                  : t("main_report.detailed_report_accordions.main_image.variant_title")}
              </span>{" "}
              {t("main_report.detailed_report_accordions.main_image.title2")}
            </h2>
            {/* <p className={styles.totalScoreDesc}> {t("main_report.detailed_report_accordions.main_image.desc")}</p> */}
          </div>
          <div className={styles.mainImageCardRight}>
            <h2 className={styles.mainImageScore}>{!!imageScore ? imageScore?.total_score : 0}%</h2>
            <p className={styles.mainImageScoreChangeText}>
              <span className={styles.mainImageScoreChangeLabel}>
                {t("main_report.detailed_report_accordions.headers.improve_by")}
              </span>
              <span className={styles.mainImageScoreChange}>
                {!!imageScore && imageScore?.score_change > 0 ? Math.ceil(imageScore?.score_change) : "0"}%
              </span>
            </p>
          </div>
        </div>
      ) : null}
      <Collapse
        defaultActiveKey={["dimensions", "photography", "policies", "data-and-category", "listing_global_issues"]}
        onChange={handlePanelChange}
        expandIcon={({ isActive }) =>
          isActive ? (
            <img src="/images/caret_down-blue.png" alt="expand" className="parentPanelExpandedIcon" />
          ) : (
            <img src="/images/caret_up.svg" alt="expand" className="parentPanelExpandedIcon" />
          )
        }
        expandIconPosition="right"
        className="parentCollapse"
      >
        {report?.data.map((category: CategoryDetail) => {
          const icon = getCardIcon(category?.category_id);

          return (
            <Panel
              key={category?.category_id}
              header={
                <div className={styles.detailedReportPanelHeader}>
                  <div className={styles.detailedReportPanelTitle}>
                    <img src={icon || "#"} alt={category?.category_label || ""} />
                    <span>{category?.category_label || ""}</span>
                  </div>
                  <div className={styles.detailedReportPanelImproveContent}>
                    <p
                      className={classNames(styles.parentPanelRate, {
                        [styles.panelIncreaseRate]: Number(category?.score_change) > 3,
                        [styles.panelDecreaseRate]: Number(category?.score_change) < 0,
                        [styles.panelNeutralRate]:
                          Number(category?.score_change) > 0 && Number(category?.score_change) <= 3
                      })}
                    >
                      {Number(category?.score_change) > 0 ? Math.ceil(Number(category?.score_change)) : 0}%
                    </p>
                    <p className={styles.panelIncreaseLabel}>Potential Improvements</p>
                  </div>
                </div>
              }
              className={styles.detailedReportPanel}
            >
              <Tabs onChange={handlePanelTabChange} className="detailedReportTabPane">
                {category.tab_details.map((tab: ReportTabDetails, index) => {
                  if (tab?.details?.length > 0) {
                    return (
                      <TabPane
                        tab={
                          <p>
                            <span>{tab?.issue_label || tab?.issue_id || ""}</span>
                            <span className="innerTabDetailsCount">{tab.details.length}</span>
                          </p>
                        }
                        key={tab?.issue_id || index}
                      >
                        {tab?.details?.length > 0 ? (
                          <Collapse
                            defaultActiveKey={expanded ? [...tab.details.map(t => t.rule_id)] : []}
                            activeKey={expanded ? [...tab.details.map(t => t.rule_id)] : activeKeys}
                            expandIcon={({ isActive }) => {
                              return isActive ? (
                                <img src="/images/caret_down-blue.png" alt="expand" className="innerPanelExpandIcon" />
                              ) : (
                                <img src="/images/caret_up.svg" alt="expand" className="innerPanelExpandIcon" />
                              );
                            }}
                            onChange={key => {
                              router?.push(`/listing-analyzer/report?jobId=${jobId}`);
                              setActiveKeys(key);
                            }}
                            className="innerCollapse"
                            expandIconPosition="right"
                          >
                            {tab.details.map((detail: ReportTabDetail) => {
                              const isSuccessfullCriteria = tab?.issue_id === "successful_criteria";
                              return (
                                <Panel
                                  header={
                                    <div className={styles.innerReportPanelHeader}>
                                      <div className={styles.innerReportPanelTitle}>
                                        {isSuccessfullCriteria ? (
                                          <span className={styles.successTitle}>
                                            <img src="/images/success-outlined.svg" width="13" alt="#" />{" "}
                                            {detail?.rule_label || ""}
                                          </span>
                                        ) : (
                                          <span>{detail?.rule_label || ""}</span>
                                        )}
                                      </div>
                                      {isSuccessfullCriteria ? (
                                        <p className={styles.innerReportPanelImproveLabel}>
                                          {t("main_report.detailed_report_accordions.headers.see_details")}
                                        </p>
                                      ) : (
                                        <p className={styles.innerReportPanelImproveLabel}>
                                          <span className={styles.innerReportPanelIncreaseLabel}>
                                            {t("main_report.detailed_report_accordions.headers.improve_by")}
                                          </span>
                                          <span
                                            className={classNames(styles.innerReportPanelRate, {
                                              [styles.innerReportPanelIncreaseRate]: detail?.potential_score > 3,
                                              [styles.innerReportPanelNeutralRate]:
                                                detail?.potential_score > 0 && detail?.potential_score <= 3,
                                              [styles.innerReportPanelNegativeRate]: detail?.potential_score < 0
                                            })}
                                          >
                                            {detail?.potential_score > 0 ? Math.ceil(detail?.potential_score) : "0"}%
                                          </span>
                                        </p>
                                      )}
                                    </div>
                                  }
                                  key={detail.rule_id}
                                >
                                  <div className={styles.innerReportPanelContentContainer}>
                                    <div>
                                      <h3 className={styles.innerReportPanelDescTitle}>
                                        {t("main_report.detailed_report_accordions.desc_title")}
                                      </h3>
                                      <p className={styles.innerReportPanelDescription}>{detail.description}</p>
                                      <div className={styles.innerReportPanelDivider} />
                                    </div>
                                    {detail?.how_to ? (
                                      <div className={styles.innerReportPanelHowToContainer}>
                                        <h4 className={styles.innerReportPanelHowToTitle}>
                                          {screens.xs ? (
                                            <img
                                              src="/images/clipboard.svg"
                                              alt="clipboard"
                                              className={styles.innerReportPanelHowToClipboard}
                                            />
                                          ) : (
                                            <img
                                              src="/images/how-to.svg"
                                              alt="clipboard"
                                              className={styles.innerReportPanelHowToClipboard}
                                            />
                                          )}
                                          <span className={styles.innerReportPanelHowToText}>
                                            {t("main_report.detailed_report.how_to")}
                                          </span>
                                        </h4>
                                        <p className={styles.innerReportPanelHowToDesc}>{detail.how_to}</p>
                                      </div>
                                    ) : null}
                                  </div>
                                </Panel>
                              );
                            })}
                          </Collapse>
                        ) : (
                          <p className={styles.innerReportPanelEmptyDetails}>
                            {t("main_report.detailed_report.empty_details")}
                          </p>
                        )}
                      </TabPane>
                    );
                  }
                  return null;
                })}
              </Tabs>
            </Panel>
          );
        })}
      </Collapse>
      <div className={styles.detailedReportNavigation}>
        <Button
          disabled={!hasPrevious}
          icon={<img src="/images/chevron-left.svg" alt="previous" width={6} />}
          className={classNames(styles.leftImageReportButton, styles.imageReportButton)}
          onClick={onSelectPreviousReport}
          label={
            screens.xs || (screens.sm && !screens.xl)
              ? t("main_report.detailed_report_accordions.buttons.prev_small")
              : t("main_report.detailed_report_accordions.buttons.prev_large")
          }
        />
        <Button
          disabled={!hasNext}
          iconPosition="right"
          icon={<img src="/images/chevron-right.svg" alt="next" width={6} />}
          className={styles.imageReportButton}
          onClick={onSelectNextReport}
          label={
            screens.xs || (screens.sm && !screens.xl)
              ? t("main_report.detailed_report_accordions.buttons.next_small")
              : t("main_report.detailed_report_accordions.buttons.next_large")
          }
        />
      </div>
    </div>
  );
}

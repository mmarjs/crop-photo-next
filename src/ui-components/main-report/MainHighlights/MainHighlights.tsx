import Tooltip from "antd/lib/tooltip";
import { useTranslation } from "react-i18next";
import { Button } from "../../components/button";
import styles from "./MainHighlights.module.scss";

interface MainHighlightsProps {
  onScrollIntoView: () => void;
}

export default function MainHighlights({ onScrollIntoView }: MainHighlightsProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.MainHighlights}>
      <div className={styles.mainHighlightsHeader}>
        <div>
          <h2 className={styles.mainHighlightsHeaderTitle}>
            <span>{t("main_report.main_highlights.title")}</span>{" "}
            <Tooltip title={t("main_report.main_highlights.tooltip")}>
              <img src="/images/tooltip-muted.svg" width={18} className={styles.titleTooltip} />
            </Tooltip>
          </h2>
          <p className={styles.mainHighlightsHeaderDesc}>
            <span className={styles.desc1}>{t("main_report.main_highlights.desc_1")}</span>{" "}
            <span className={styles.desc2} onClick={onScrollIntoView}>
              {t("main_report.main_highlights.desc_2")}
            </span>{" "}
            <span className={styles.desc2Cont}>{t("main_report.main_highlights.desc_2_cont")}</span>{" "}
            <span className={styles.link} onClick={onScrollIntoView}>
              {t("main_report.main_highlights.link")}
            </span>{" "}
          </p>
        </div>
        <Button
          type="primary"
          icon={<img src="/images/arrow_down_white.svg" alt="arrow down" width={14} height={16} />}
          label={t("main_report.detailed_report.title")}
          className={styles.detailedReportbutton}
          onClick={onScrollIntoView}
        />
      </div>

      <div className={styles.mainHighlightsCard}>
        <div>
          <h3 className={styles.mainHighlightCardHeading}>
            <span>{t("main_report.improve_score.desc")} </span>
            <span className={styles.issuesText}>
              {t("main_report.improve_score.desc_issues", {
                issues_count: 27
              })}
              .{" "}
            </span>{" "}
            <span>{t("main_report.improve_score.desc_cont")} </span>
            <span className={styles.mainHighlightIncreaseRateText}>{59}%</span>
          </h3>
        </div>
        <div className={styles.mainHighlightsTable}></div>
      </div>

      <div className={styles.openDesktopReminder}>
        <h4 className={styles.openDesktopReminderText}>
          <span>{t("main_report.desktop_reminder.open")}</span>
          <span className={styles.gradientText}>Crop.Photo </span>
          <span>{t("main_report.desktop_reminder.open_cont")}</span>
        </h4>
      </div>
    </div>
  );
}

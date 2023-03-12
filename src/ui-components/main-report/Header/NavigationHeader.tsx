import { Drawer, message, Grid } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Breadcrumbs } from "../../components/breadcrumb";
import { Button } from "../../components/button";
import CopyOutlined from "@ant-design/icons/CopyOutlined";
import styles from "./NavigationHeader.module.scss";
import useHomepageBaseURL from "../../../hooks/useHomepageBaseURL";

interface NavigationHeaderProps {
  scrollTo?: () => void;
  showButtons?: boolean;
}

const { useBreakpoint } = Grid;

export default function NavigationHeader({ scrollTo, showButtons }: NavigationHeaderProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const screens = useBreakpoint();
  const { jobId } = router?.query;
  const [showMenu, setShowMenu] = useState(false);
  const homepageBaseURL = useHomepageBaseURL(window.location.host);
  const breadcrumbPathArray = [
    [t("home.home"), homepageBaseURL],
    [t("main_report.header.listing_analyzer"), `${homepageBaseURL}/listing-analyzer`],
    [t("main_report.header.report"), `/listing-analyzer/report?jobId=${jobId}`]
  ];

  const copyToClipBoard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      message.success(t("main_report.header.copied"));
    } catch (err) {
      console.error("Failed to copy!");
    }
  };

  return (
    <header className={styles.NavigationHeader}>
      <div className={styles.headerContainer}>
        <div>
          <Breadcrumbs pathArray={breadcrumbPathArray} />
        </div>
        <div>
          <Link href={homepageBaseURL}>
            <img src="/images/crop-photo-large.svg" alt="logo" className={styles.headerLogo} />
          </Link>
        </div>
        {showButtons ? (
          <div className={styles.headerActions}>
            <Button
              icon={<CopyOutlined width={16} />}
              type="default"
              label={t("main_report.header.copy")}
              onClick={copyToClipBoard}
            />
            <Button
              icon={<img src="/images/report-icon.svg" width={16} />}
              type="primary"
              label={t("main_report.header.see_report.large")}
              onClick={scrollTo}
            />
          </div>
        ) : null}
      </div>
      <div className={styles.mobileHeaderContainer}>
        <Link href={homepageBaseURL}>
          <img src="/images/crop-photo-large.svg" alt="logo" className={styles.mobileLogo} />
        </Link>
        <img
          src="/images/burger-icon.svg"
          alt="burger"
          className={styles.burgerIcon}
          onClick={() => setShowMenu(old => !old)}
        />
        <Drawer
          className={styles.mainReportDrawer}
          title={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",

                padding: "0"
              }}
            >
              <Link href={homepageBaseURL}>
                <img src="/images/crop-photo-large.svg" alt="logo" className={styles.mobileLogo} />
              </Link>
              <img
                src="/images/close-black.svg"
                alt="close-drawer"
                className={styles.closeMenuIcon}
                width="16"
                onClick={() => setShowMenu(old => !old)}
              />
            </div>
          }
          closable={false}
          placement="top"
          onClose={() => setShowMenu(old => !old)}
          open={showMenu}
          extra={null}
        >
          <div className={styles.mobileHeaderContainer}>
            <nav className={styles.mobileHeaderNavigation}>
              <Link href={homepageBaseURL}>{t("home.home")}</Link>
              <Link href={`${homepageBaseURL}/listing-analyzer`}>{t("main_report.header.listing_analyzer")}</Link>
              <Link href={`/listing-analyzer/report?jobId=${jobId}`}>{t("main_report.header.report")}</Link>
            </nav>
            <div className={styles.mobileHeaderActions}>
              <Button
                icon={<CopyOutlined width={16} />}
                type="default"
                label={t("main_report.header.copy")}
                onClick={copyToClipBoard}
              />
              <Button
                icon={<CopyOutlined width={16} />}
                type="primary"
                label={t("main_report.header.see_report.small")}
                onClick={scrollTo}
              />
            </div>
          </div>
        </Drawer>
      </div>
    </header>
  );
}

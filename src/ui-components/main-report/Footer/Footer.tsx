import { useTranslation } from "react-i18next";
import { Button } from "../../components/button";
import MarketplaceCard from "../MarketplaceCard.tsx/MarketplaceCard";
import styles from "./Footer.module.scss";

const marketplaces = ["nordstrom", "aliexpress", "etsy"];

export default function Footer() {
  const { t } = useTranslation();
  return (
    <div className={styles.Footer}>
      <div className={styles.header}>
        <h1 className={styles.header1}>{t("main_report.footer.title1")}</h1>
        <h1 className={styles.header2}>{t("main_report.footer.title2")}</h1>
      </div>

      <div className={styles.marketplaces}>
        {marketplaces.map(mp => (
          <MarketplaceCard name={mp} key={mp} />
        ))}
      </div>

      <Button
        disabled
        className={styles.footerButton}
        type="primary"
        label={t("main_report.footer.explore")}
        icon={<img src="/images/lock-outline.svg" alt="lock" />}
      />
    </div>
  );
}

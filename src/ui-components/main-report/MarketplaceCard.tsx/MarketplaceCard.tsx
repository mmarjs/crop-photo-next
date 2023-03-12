import { useState } from "react";
import { useTranslation } from "react-i18next";
import NotifyMeModal from "../NotifyMeModal";
import styles from "./MarketplaceCard.module.scss";

export default function MarketplaceCard({ name }: { name: string }) {
  const { t } = useTranslation();
  const [showNotifyMe, setShowNotifyMe] = useState(false);
  const imageUrl = `/images/${name}.svg`;

  const showNotifyMeModal = () => {
    setShowNotifyMe(old => !old);
  };

  const handleOk = () => {};
  return (
    <>
      <div className={styles.MarketplaceCard} onClick={showNotifyMeModal}>
        <div className={styles.marketplaceCardContent}>
          <img src={imageUrl} alt={name} className={styles.marketplaceCardLogo} />
          <p className={styles.marketplaceCardText}>{t("main_report.marketplace_card.coming_soon")}</p>
        </div>
      </div>
      <NotifyMeModal show={showNotifyMe} onClose={showNotifyMeModal} onOk={handleOk} marketplace={name} />
    </>
  );
}

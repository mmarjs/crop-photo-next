import { Button } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";
import { useIntercom } from "react-use-intercom";
import styles from "./learnMore.module.scss";

interface LearnMoreProps {
  article: string | number;
}

const LearnMore = ({ article }: LearnMoreProps) => {
  const { showArticle } = useIntercom();
  const { t } = useTranslation();

  const onIconClick = () => {
    if (typeof article === "string" && article.startsWith("https://")) {
      window.open(article, "_blank");
    } else if (typeof article === "number") {
      showArticle(article);
    }
  };

  return (
    <Button
      // href="https://help.crop.photo/en/articles/6079897-a-step-by-step-guide-to-crop-photo#h_658ef13c5b"
      size="small"
      type="link"
      className={styles.learnMoreBtn}
      onClick={() => onIconClick()}
    >
      <span className={styles.learnMoreBtn}>{t("home.learn_more")}</span>
    </Button>
  );
};

export default LearnMore;

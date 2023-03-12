import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./removeBackground.module.scss";
import { Button } from "antd";
import { Checkbox } from "../checkbox";
import { useRemoveBackground } from "../../smart-crop-components/jotai";
import { OpenInAppHelp } from "../icon/icon.composition";
import { ARTICLE_URL_ID } from "../../../common/Enums";
import LearnMore from "../LearnMore";
import { CheckboxChangeEvent } from "antd/lib/checkbox";

const RemoveBackround = () => {
  const { t } = useTranslation();
  const [removeBackground, setRemoveBackground] = useRemoveBackground();
  const handleRemoveBackground = (e: CheckboxChangeEvent) => {
    e.stopPropagation();
    setRemoveBackground(!removeBackground);
  };
  return (
    <div className={styles.wrapper}>
      <div className={styles.label}>
        <div style={{ marginRight: "0.5rem" }}>{t("configuration.left_panel.remove_background.label")}</div>
        {/* <Help
          className={styles.helpIcon}
          width={16}
          viewBox="0 0 18 16"
          onClick={() => {
            // showArticle(6101400);
          }}
        /> */}
        <OpenInAppHelp article={ARTICLE_URL_ID.REMOVE_BACKGROUND} />
      </div>
      <div className={styles.shortdescription}>
        {t("configuration.left_panel.remove_background.description")}
        {/* <Button
          // href="https://help.crop.photo/en/articles/6079897-a-step-by-step-guide-to-crop-photo#h_658ef13c5b"
          size="small"
          type="link"
          className={styles.learnMoreBtn}
          onClick={() => {
            // showArticle(6079897);
          }}
        >
          <span className="bot-launch-what-is-crop-marker">
            {t("configuration.left_panel.remove_background.learn_more")}
          </span>
        </Button> */}
        <LearnMore article={ARTICLE_URL_ID.REMOVE_BACKGROUND_URL as string} />
      </div>
      <Checkbox
        className={styles.removeBg}
        text={t("configuration.left_panel.remove_background.checkbox_label")}
        onChange={handleRemoveBackground}
        checked={removeBackground}
      />
    </div>
  );
};

export default RemoveBackround;

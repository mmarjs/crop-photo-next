import { Button } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./crop-side.module.scss";
import Help from "../../../../assets/icons/help-icon-dark.svg";
import { useIntercom } from "react-use-intercom";
const CropSide = ({ active, options, onChange }: any) => {
  const { t } = useTranslation();
  const { showArticle } = useIntercom();

  return (
    <div className="m-3">
      <div className={styles.label}>
        {t("configuration.left_panel.crop_side.label")}
        <Help
          className={styles.cropSideHelpIcon}
          width={16}
          viewBox="0 0 18 16"
          onClick={() => {
            showArticle(6119443);
          }}
        />
      </div>
      <div className={styles.cropSideButtonWrapper}>
        {options.map((e: any, i: number) => (
          <Button
            key={"CROP_SIDE" + i}
            className={
              active === e.value
                ? `${styles.buttonSelected} ${styles.buttonClass}`
                : `${styles.buttonClass} ${styles.buttonUnselected}`
            }
            onClick={() => onChange(e.value)}
            type={"default"}
          >
            {t(e.label)}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CropSide;

/* eslint-disable react/no-children-prop */
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { useIntercom } from "react-use-intercom";
import { HelpIconDark } from "../../assets";
import { BasicRadioBtn } from "../../components/radio-button";
import { Card } from "../../components/smart-crop-config/leftpanel/card/card";
import { cardTypeOptions } from "../../components/smart-crop-config/smart-crop-config-constants";
import { useUpdateCropSize } from "../jotai";
import { CROP_TYPES, MODE } from "../jotai/atomTypes";
import { useCropTypeAtom } from "../jotai/customFaceCrop/atomStore";
import { datadogLogs } from "@datadog/browser-logs";
import styles from "./crop-type.module.scss";

const CropType: FC = () => {
  const [cropType, setCropType] = useCropTypeAtom();
  const [, updateCropSize] = useUpdateCropSize();
  const { t } = useTranslation();
  const { showArticle } = useIntercom();

  return (
    <div className={styles.wrapper}>
      <div className={styles.label}>
        {t("configuration.left_panel.crop_type.label")}
        <HelpIconDark
          className={styles.cropTypeHelpIcon}
          width={16}
          viewBox="0 0 18 16"
          onClick={() => {
            showArticle(6101400);
          }}
        />
      </div>
      {cardTypeOptions.map((option, i) => (
        <Card
          key={`option-${i}`}
          image={option.img}
          bg={option.bg}
          coverClass={styles.coverClass}
          classNames={styles.cardclass}
          onClick={() => {
            const type = option.value as string;
            if (type === CROP_TYPES.CROP_AROUND) {
              updateCropSize({ top: 20, bottom: 20, left: 20, right: 20 });
            }
            if (type === CROP_TYPES.CROP_FROM) {
              updateCropSize({ top: 100, bottom: 100, left: 100, right: 100 });
            }
            setCropType(type);
            datadogLogs.logger.info("Selected Crop Type", { valueSelected: type });
          }}
          children={
            <>
              <div className={styles.radioButton}>
                <BasicRadioBtn value={option.value} checked={cropType === option.value} />
                {t(option.label)}
              </div>
              <div className={styles.subText}>{t(option.subtitle)}</div>
            </>
          }
          hoverable={false}
        />
      ))}
    </div>
  );
};

export default CropType;

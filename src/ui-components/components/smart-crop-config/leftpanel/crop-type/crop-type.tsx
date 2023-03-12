import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { useTranslation } from "react-i18next";
import isEmpty from "lodash/isEmpty";
import { Logger } from "aws-amplify";

import { BasicRadioBtn } from "../../../radio-button";
import { CropTypeProps } from "../types";
import { Card } from "../card/card";
import { CROP_TYPE, MODE } from "../../smart-crop-config-constants";
import { Button } from "antd";
import { SmartCropStructType } from "../../../../../redux/structs/smartcrop";
import { updateCropSize, updateCropType } from "../../../../../redux/actions/smartcropActions";
import { datadogLogs } from "@datadog/browser-logs";

import styles from "./crop-type.module.scss";
import { OBJECT_TYPE } from "../../../../../common/Types";
import { useIntercom } from "react-use-intercom";
import { HelpIconDark } from "../../../../assets";

const CropType = ({
  selectedMode,
  onModeChange,
  options,
  onChange,
  updateCropType,
  updateCropSize,
  cropType,
  disabled
}: CropTypeProps) => {
  const logger = new Logger("components:smart-crop-config:left-panel:crop-type");
  const [value, setValue] = useState<string>(cropType ?? "");
  const { t } = useTranslation();

  const { showArticle } = useIntercom();

  useEffect(() => {
    if (value === "CROP_AROUND") {
      updateCropSize({ top: 20, bottom: 20, left: 20, right: 20 });
    } else {
      updateCropSize({ top: 100, bottom: 100, left: 100, right: 100 });
    }
  }, [value]);

  if (selectedMode === MODE.VIEW) {
    return (
      <div className={styles.displayWrapper}>
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
        <div className={styles.valueLabel}>
          {cropType === CROP_TYPE.CROP_FROM
            ? t("configuration.left_panel.crop_type.crop_from_card.label")
            : t("configuration.left_panel.crop_type.crop_around_card.label")}
        </div>
        <div>
          <Button className={styles.linkbutton} onClick={() => onModeChange(MODE.EDIT)}>
            {t("configuration.left_panel.crop_type.edit_button")}
          </Button>
        </div>
      </div>
    );
  }

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
      {options.map((e, i) => (
        <Card
          key={`key${i}`}
          image={e.img}
          bg={e.bg}
          coverClass={styles.coverClass}
          classNames={styles.cardclass}
          onClick={() => {
            const val = e.value as string;
            setValue(val);
            datadogLogs.logger.info("Selected Crop Type", { valueSelected: val });
            updateCropType(val);
          }}
          // eslint-disable-next-line react/no-children-prop
          children={
            <>
              <div className={styles.radioButton}>
                <BasicRadioBtn value={e.value} checked={cropType === e.value} />
                {t(e.label)}
              </div>
              <div className={styles.subText}>{t(e.subtitle)}</div>
            </>
          }
          hoverable={false}
        />
      ))}
      <Button
        disabled={isEmpty(value) || disabled}
        className={styles.nextButton}
        onClick={() => {
          onModeChange(MODE.VIEW);
          onChange(cropType);
        }}
      >
        {t("configuration.left_panel.crop_type.next_button")}
      </Button>
    </div>
  );
};

const mapStateToProps = (state: { smartcrop: SmartCropStructType }) => ({
  cropType: state.smartcrop.cropType
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  updateCropType: (cropType: string) => dispatch(updateCropType(cropType)),
  updateCropSize: (size: OBJECT_TYPE) => dispatch(updateCropSize(size))
});

export default connect(mapStateToProps, mapDispatchToProps)(CropType);

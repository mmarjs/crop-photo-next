/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";
import { Button, InputNumber } from "antd";
import { cropDropEvent, CROP_EVENTS } from "../../modal/CropDataSharing";
import styles from "./crop-size.module.scss";
import { useTranslation } from "react-i18next";
import { OBJECT_TYPE } from "../../../../../common/Types";
import useDebounce from "../../../../../hooks/useDebounce";
import _ from "lodash";
import { Tooltip } from "../../../tooltip";
import { CropSizeBottom, CropSizeLeft, CropSizeRight, CropSizeTop, HelpIconDark } from "../../../../assets";
import classNames from "classnames";
import { CROP_TYPE } from "../../smart-crop-config-constants";
import { useIntercom } from "react-use-intercom";

export type CropSizeProps = {
  onChange: Function;
  values: OBJECT_TYPE;
  disabled: boolean;
  updateCropSize: Function;
  cropType: string;
};

export const CropSize = ({ updateCropSize, onChange, values, disabled, cropType }: CropSizeProps) => {
  const { t } = useTranslation();
  const [defaultCropValues, setDefaultCropValues] = useState<OBJECT_TYPE>({
    top: 100,
    bottom: 100,
    left: 100,
    right: 100
  });
  // let debouncedCropValue = useDebounce(cropValues, 500);
  const { showArticle } = useIntercom();

  useEffect(() => {
    if (cropType === CROP_TYPE.CROP_FROM) {
      setDefaultCropValues({
        top: 100,
        bottom: 100,
        left: 100,
        right: 100
      });
    }
    if (cropType === CROP_TYPE.CROP_AROUND) {
      setDefaultCropValues({
        top: 20,
        bottom: 20,
        left: 20,
        right: 20
      });
    }
  }, [cropType]);

  return (
    <>
      <div className={styles.cropSizeContainer}>
        <div className={styles.label}>
          {t("configuration.left_panel.crop_size.label")}
          <HelpIconDark
            className={styles.cropSizeHelpIcon}
            width={16}
            viewBox="0 0 18 16"
            onClick={() => {
              showArticle(6119421);
            }}
          />
        </div>
        <div className={styles.inputWrapperTopBottom}>
          <InputNumber
            prefix={<span className={styles.prefixText}>T</span>}
            className={styles.inputBox}
            min={0}
            max={100}
            formatter={value => `${value}%`}
            value={Math.ceil(values.top)}
            onChange={value => {
              updateCropSize({ ...values, top: value as number });
            }}
            disabled={disabled}
          />
        </div>
        <div className={styles.inputWrapperMiddle}>
          <InputNumber
            prefix={<span className={styles.prefixText}>L</span>}
            className={styles.inputBox}
            min={0}
            max={100}
            formatter={value => `${value}%`}
            value={Math.ceil(values.left)}
            onChange={value => {
              updateCropSize({ ...values, left: value as number });
            }}
            // controls={false}
            disabled={disabled}
          />
          <div className={styles.rectangle}>
            <div className={styles.overlap_group}>
              <CropSizeTop
                className={classNames(styles.smart_crop_configura_1, {
                  [styles.active]: Math.ceil(values.top) !== defaultCropValues.top
                })}
              />
              <CropSizeLeft
                className={classNames(styles.smart_crop_configura_2, {
                  [styles.active]: Math.ceil(values.left) !== defaultCropValues.left
                })}
              />
              <CropSizeRight
                className={classNames(styles.smart_crop_configura_3, {
                  [styles.active]: Math.ceil(values.right) !== defaultCropValues.right
                })}
              />
              <CropSizeBottom
                className={classNames(styles.smart_crop_configura_4, {
                  [styles.active]: Math.ceil(values.bottom) !== defaultCropValues.bottom
                })}
              />
            </div>
          </div>
          <InputNumber
            prefix={<span className={styles.prefixText}>R</span>}
            className={styles.inputBox}
            min={0}
            max={100}
            formatter={value => `${value}%`}
            value={Math.ceil(values.right)}
            onChange={value => {
              updateCropSize({ ...values, right: value });
            }}
            disabled={disabled}
          />
        </div>
        <div className={styles.inputWrapperTopBottom}>
          <InputNumber
            // type="text"
            prefix={<span className={styles.prefixText}>B</span>}
            className={styles.inputBox}
            min={0}
            max={100}
            formatter={value => `${value}%`}
            value={Math.ceil(values.bottom)}
            onChange={value => {
              updateCropSize({ ...values, bottom: value });
            }}
            disabled={disabled}
          />
        </div>
      </div>
    </>
  );
};

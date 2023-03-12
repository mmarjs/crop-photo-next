import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./crop-area.module.scss";
import { InputNumber } from "antd";
import { CropSizeBottom, CropSizeLeft, CropSizeRight, CropSizeTop } from "../../assets";
import classNames from "classnames";
import { useCropArea, useCropAreaAround } from "../../smart-crop-components/jotai";
import { CropSideValues } from "../../smart-crop-components/jotai/atomTypes";
import useDebounce from "../../../hooks/useDebounce";
import { useIntercom } from "react-use-intercom";
import { OpenInAppHelp } from "../icon/icon.composition";
import { ARTICLE_URL_ID } from "../../../common/Enums";
import { useCropTypeAtom } from "../../smart-crop-components/jotai/customFaceCrop/atomStore";

const defaultCropValues = { top: 100, left: 100, right: 100, bottom: 100 };

const CropArea = () => {
  const [cropArea, setCropArea] = useCropArea();
  const [cropAreaAround, setCropAreaAround] = useCropAreaAround();
  const [editedCropArea, setEditedCropArea] = useState<CropSideValues>(cropArea);
  const { t } = useTranslation();
  const debouncedCropArea = useDebounce(editedCropArea, 1000);
  const [cropType] = useCropTypeAtom();

  const { showArticle } = useIntercom();

  useEffect(() => {
    if (!!debouncedCropArea) {
      if (cropType === "CROP_AROUND") {
        setCropAreaAround(debouncedCropArea);
      } else {
        setCropArea(debouncedCropArea);
      }
    }
  }, [debouncedCropArea]);

  useEffect(() => {
    if (cropType === "CROP_AROUND") {
      if (!!cropAreaAround) {
        setEditedCropArea(cropAreaAround);
      }
    } else {
      if (!!cropArea) {
        setEditedCropArea(cropArea);
      }
    }
  }, [cropArea]);

  return (
    <div className={styles.cropSizeContainer}>
      <div className={styles.label}>
        <div style={{ marginRight: "0.5rem" }}>{t("configuration.left_panel.crop_size.label_alt")}</div>
        {/* <HelpIconDark
          className={styles.cropSizeHelpIcon}
          width={16}
          viewBox="0 0 18 16"
          onClick={() => {
            showArticle(6119421);
          }}
        /> */}
        <OpenInAppHelp article={ARTICLE_URL_ID.CROP_MARKER_ADV_SETTINGS} />
      </div>
      <div className={styles.inputWrapperTopBottom}>
        <InputNumber
          // type="text"
          prefix={<span className={styles.prefixText}>T</span>}
          className={styles.inputBox}
          min={0}
          max={100}
          formatter={value => `${value}%`}
          value={Math.ceil(editedCropArea.top)}
          onChange={value => {
            setEditedCropArea({ ...editedCropArea, top: value as number });
          }}
          // controls={false}
          // disabled={disabled}
          // size="large"
        />
      </div>
      <div className={styles.inputWrapperMiddle}>
        <InputNumber
          // type="text"
          prefix={<span className={styles.prefixText}>L</span>}
          className={styles.inputBox}
          min={0}
          max={100}
          formatter={value => `${value}%`}
          value={Math.ceil(editedCropArea.left)}
          onChange={value => {
            setEditedCropArea({ ...editedCropArea, left: value as number });
          }}
          // // controls={false}
          // disabled={disabled}
        />
        <div className={styles.rectangle}>
          <div className={styles.overlap_group}>
            <CropSizeTop
              className={classNames(styles.smart_crop_configura_1, {
                [styles.active]: Math.ceil(editedCropArea.top) !== defaultCropValues.top
              })}
              // className={styles.smart_crop_configura_1}
            />
            <CropSizeLeft
              className={classNames(styles.smart_crop_configura_2, {
                [styles.active]: Math.ceil(editedCropArea.left) !== defaultCropValues.left
              })}
              // className={styles.smart_crop_configura_2}
            />
            <CropSizeRight
              className={classNames(styles.smart_crop_configura_3, {
                [styles.active]: Math.ceil(editedCropArea.right) !== defaultCropValues.right
              })}
              // className={styles.smart_crop_configura_3}
            />
            <CropSizeBottom
              className={classNames(styles.smart_crop_configura_4, {
                [styles.active]: Math.ceil(editedCropArea.bottom) !== defaultCropValues.bottom
              })}
              // className={styles.smart_crop_configura_4}
            />
          </div>
        </div>
        <InputNumber
          // type="text"
          prefix={<span className={styles.prefixText}>R</span>}
          className={styles.inputBox}
          min={0}
          max={100}
          formatter={value => `${value}%`}
          value={Math.ceil(editedCropArea.right)}
          // // onChange={(value: number) => setCropValues({ ...cropValues, right: value })}
          onChange={value => {
            setEditedCropArea({ ...editedCropArea, right: value as number });
          }}
          // // controls={false}
          // disabled={disabled}
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
          value={Math.ceil(editedCropArea.bottom)}
          // // onChange={(value: number) => setCropValues({ ...cropValues, bottom: value })}
          onChange={value => {
            setEditedCropArea({ ...editedCropArea, bottom: value as number });
          }}
          // // controls={false}
          // disabled={disabled}
        />
      </div>
    </div>
  );
};

export default CropArea;

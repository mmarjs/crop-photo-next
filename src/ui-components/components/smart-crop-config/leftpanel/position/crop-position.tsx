// @ts-nocheck
import { OBJECT_TYPE } from "../../../../../common/Types";
import { InputNumber } from "antd";
import { useTranslation } from "react-i18next";

import styles from "./crop-position.module.scss";

type CropPositionProps = {
  cropPosition: OBJECT_TYPE;
  onCropPositionChange: Function;
  disabled: boolean;
};

const CropPosition = ({ cropPosition, onCropPositionChange, disabled }: CropPositionProps) => {
  const { t } = useTranslation();
  const onChange = (key: string, value: number) => {
    if (Number(value) > -1) {
      onCropPositionChange({ ...cropPosition, [key]: Number(value) });
    }
  };
  const x: number = cropPosition.x;
  const y: number = cropPosition.y;
  return (
    <div className="m-3">
      <div className={styles.label}>{t("configuration.left_panel.position.label")}</div>
      <div className={styles.cropContainerSide}>
        <InputNumber
          prefix={<span className={styles.prefixText}>X</span>}
          className={styles.inputBox}
          min={0}
          max={100}
          formatter={value => `${value}%`}
          value={x}
          onChange={value => onChange("x", value)}
          controls={false}
          disabled={disabled}
        />
        <InputNumber
          prefix={<span className={styles.prefixText}>Y</span>}
          className={styles.inputBox}
          min={0}
          max={100}
          formatter={value => `${value}%`}
          value={y}
          onChange={value => onChange("y", value)}
          controls={false}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default CropPosition;

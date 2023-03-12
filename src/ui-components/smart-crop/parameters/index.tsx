// @ts-nocheck
import { ChangeEvent, ChangeEventHandler, useEffect, useMemo, useState } from "react";
import { ColorResult, SketchPicker } from "react-color";
import type, { RadioChangeEvent } from "antd";
import Radio from "antd/lib/radio";
import Space from "antd/lib/space";
import Input from "antd/lib/input";
import { useTranslation } from "react-i18next";

import reactCSS from "reactcss";
import styles from "./parameters.module.scss";

type ParametersProps = {
  onParamChange: (e: RadioChangeEvent) => void;
  parameter: string;
  onHexColorChange: (hex: string) => void;
  isValidHex: boolean;
};

const parameters = [
  {
    label: "Transparent",
    value: "transparent"
  },
  {
    label: "White",
    value: "white"
  },
  {
    label: "Custom",
    value: "custom"
  }
];

export default function Parameters({ onParamChange, parameter, onHexColorChange, isValidHex }: ParametersProps) {
  const { t } = useTranslation();
  const [hexColor, setHexColor] = useState<string>("#FFFFFF");
  const [displayColorPicker, setDisplayColorPicker] = useState<boolean>(false);

  useEffect(() => {
    onHexColorChange(hexColor);
  }, []);

  const handleClick = () => {
    setDisplayColorPicker(old => !old);
  };

  const handleClose = () => {
    setDisplayColorPicker(old => !old);
  };

  const handleChange = (color: ColorResult, event: ChangeEvent<HTMLInputElement>) => {
    setHexColor(color.hex);
    onHexColorChange(color.hex);
  };

  const handleHexColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHexColor(value);
    onHexColorChange(value);
  };

  const colorPickerStyles = useMemo(
    () =>
      reactCSS({
        default: {
          pickerContainer: {
            width: 20,
            height: 20
          },
          color: {
            width: "20px",
            height: "20px",
            borderRadius: "2px",
            border: "2px solid #06142529",
            marginRight: 16,
            background: hexColor
          },
          swatch: {
            background: "#fff",
            borderRadius: "1px",
            display: "inline-block",
            cursor: "pointer"
          },
          popover: {
            position: "absolute",
            zIndex: "2"
          },
          cover: {
            position: "fixed",
            top: "0px",
            right: "0px",
            bottom: "0px",
            left: "0px"
          }
        }
      }),
    [hexColor]
  );

  return (
    <div className={styles.ParametersContainer}>
      <h3 className={styles.ParametersTitle}>{t("upload.parameters.subtitle")}</h3>
      <p className={styles.ParametersDesc}>{t("upload.parameters.desc")}</p>
      <div className={styles.ParametersRadioGroupContainer}>
        <Radio.Group
          onChange={onParamChange}
          value={parameter}
          defaultValue="transparent"
          className={styles.ParametersRadioGroup}
        >
          <Space direction="vertical" className={styles.SpaceContainer}>
            {parameters.map(param => (
              <Radio value={param.value}>
                <span className={styles.ParameterRadioLabel}>{param.label}</span>
              </Radio>
            ))}
            {parameter === "custom" ? (
              <>
                <Input
                  prefix={
                    <div style={colorPickerStyles.pickerContainer}>
                      <div style={colorPickerStyles.swatch} onClick={handleClick}>
                        <div style={colorPickerStyles.color} />
                      </div>
                      {displayColorPicker ? (
                        //@ts-ignore
                        <div style={colorPickerStyles.popover}>
                          {/* @ts-ignore */}
                          <div style={colorPickerStyles.cover} onClick={handleClose} />
                          <SketchPicker color={hexColor} disableAlpha onChange={handleChange} />
                        </div>
                      ) : null}
                    </div>
                  }
                  type="text"
                  value={hexColor.toUpperCase()}
                  onChange={handleHexColorChange}
                  maxLength={7}
                />
              </>
            ) : null}
          </Space>
        </Radio.Group>
        {parameter === "custom" && !isValidHex ? (
          <p className={styles.customParameterError}>{t("upload.parameters.errors.hex_format")}</p>
        ) : null}
      </div>
    </div>
  );
}

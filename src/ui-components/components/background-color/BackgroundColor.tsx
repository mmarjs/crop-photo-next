import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import styles from "./background-color.module.scss";
import { ColorResult, SketchPicker } from "react-color";
import Radio from "antd/lib/radio";
import Space from "antd/lib/space";
import Input from "antd/lib/input";
import reactCSS from "reactcss";
import { useTranslation } from "react-i18next";
import {
  useBackgroundColor,
  useImageViewerParameter,
  useTransparency,
  useCustomBackgroundPaths
} from "../../smart-crop-components/jotai";
import useDebounce from "../../../hooks/useDebounce";
import { OpenInAppHelp } from "../icon/icon.composition";
import { ARTICLE_URL_ID } from "../../../common/Enums";
import LearnMore from "../LearnMore";
import { t } from "i18next";
import { Logger } from "aws-amplify";
import { RadioChangeEvent } from "antd";

const regex = /^#([0-9A-F]{3}){1,2}$/i;

const parameters = [
  {
    label: t("Transparent"),
    value: "transparent"
  },
  {
    label: t("White"),
    value: "white"
  },
  {
    label: t("Solid Color"),
    value: "solid-color"
  },
  {
    label: t("Background Image"),
    value: "bg-image"
  }
];

let reactCssConfig = {
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
    background: "#fff"
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
    left: "270px"
  }
};

const BackgroundColor = () => {
  const logger = new Logger("ui-components:background-color:BackgroundColor");
  const { t } = useTranslation();
  const [hexColor, setHexColor] = useBackgroundColor();
  const [editedHexColor, setEditedHexColor] = useState<string>(hexColor);
  const [customBackgroundPaths, setCustomBackgroundPaths] = useCustomBackgroundPaths();
  const [displayColorPicker, setDisplayColorPicker] = useState<boolean>(false);
  const [parameter, setParameter] = useImageViewerParameter();
  const [, setIsTransparent] = useTransparency();
  const [isValidHex, setIsValidHex] = useState<boolean>(true);
  const debouncedHexColor = useDebounce(editedHexColor, 300);
  const colorPickerRef = useRef(null);

  useEffect(() => {
    // scroll to bottom
    if (parameter === "solid-color") {
      (colorPickerRef.current as any)?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    }
  }, [displayColorPicker, parameter]);

  useEffect(() => {
    const isValid = regex.test(debouncedHexColor);
    setIsValidHex(isValid);
    setHexColor(debouncedHexColor);
  }, [debouncedHexColor, setHexColor]);

  const handleClick = () => {
    setDisplayColorPicker(old => !old);
  };

  const handleClose = () => {
    setDisplayColorPicker(old => !old);
  };

  const handleChange = (color: ColorResult, event: ChangeEvent<HTMLInputElement>) => {
    setEditedHexColor(color.hex);
    setHexColor(color.hex);
    if (color.hex.toUpperCase() === "#FFFFFF") {
      setParameter("white");
    } else {
      setParameter("solid-color");
    }
  };

  const handleHexColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEditedHexColor(value);
    setHexColor(value);
  };

  const colorPickerStyles = useMemo(() => {
    if (editedHexColor) {
      reactCssConfig.color.background = editedHexColor;
    }
    return reactCSS({
      default: reactCssConfig
    });
  }, [editedHexColor]);

  const onBackgroundSettingsChange = (e: RadioChangeEvent) => {
    e.stopPropagation();
    let transparent = 0;
    let newHexColor = hexColor;
    let newCustomBackgroundS3Paths = customBackgroundPaths?.length > 0 ? customBackgroundPaths : [];
    let selectedValue = e.target.value;
    if (selectedValue === "transparent") {
      transparent = 1;
      newHexColor = "#FFFFFF";
      newCustomBackgroundS3Paths.length = 0;
    } else if (selectedValue === "white") {
      transparent = 0;
      newHexColor = "#FFFFFF";
      newCustomBackgroundS3Paths = [];
    } else if (selectedValue === "solid-color") {
      transparent = 0;
      newCustomBackgroundS3Paths.length = 0;
      newHexColor = editedHexColor;
    } else if (selectedValue === "bg-image") {
      transparent = 0;
      newHexColor = "#FFFFFF";
    }
    setIsTransparent(transparent);
    setHexColor(newHexColor);
    setCustomBackgroundPaths(newCustomBackgroundS3Paths);
    logger.debug(
      `Background remove setting value change: ${selectedValue}. transparency=${transparent} hexColor=${newHexColor} newCustomBackgroundPaths=${newCustomBackgroundS3Paths?.join(
        ", "
      )}`
    );
    setParameter(selectedValue);
  };

  return (
    <div className={styles.ParametersContainer}>
      <div className={styles.headerWrapper}>
        <h3 className={styles.ParametersTitle}>{t("upload.parameters.subtitle")}</h3>
        <OpenInAppHelp article={ARTICLE_URL_ID.BACKGROUND} />
      </div>

      <p className={styles.ParametersDesc}>
        {t("upload.parameters.desc")}
        <LearnMore article={ARTICLE_URL_ID.BACKGROUND_URL as string} />
      </p>
      <div className={styles.ParametersRadioGroupContainer}>
        <Radio.Group
          onChange={onBackgroundSettingsChange}
          value={parameter}
          defaultValue="transparent"
          className={styles.ParametersRadioGroup}
        >
          <Space direction="vertical" className={styles.SpaceContainer}>
            {parameters.map((param, index) => {
              return (
                <>
                  <Radio value={param.value} key={index}>
                    <span className={styles.ParameterRadioLabel}>{param.label}</span>
                  </Radio>
                  {param.value === "solid-color" && parameter === "solid-color" ? (
                    <Input
                      prefix={
                        <div style={colorPickerStyles.pickerContainer}>
                          <div style={colorPickerStyles.swatch} onClick={handleClick}>
                            <div style={colorPickerStyles.color} />
                          </div>
                          {displayColorPicker ? (
                            //@ts-ignore
                            <div ref={colorPickerRef} style={colorPickerStyles.popover}>
                              {/* @ts-ignore */}
                              <div style={colorPickerStyles.cover} onClick={handleClose} />
                              <SketchPicker color={editedHexColor} disableAlpha onChange={handleChange} />
                            </div>
                          ) : null}
                        </div>
                      }
                      type="text"
                      value={editedHexColor?.toUpperCase()}
                      onChange={handleHexColorChange}
                      maxLength={7}
                    />
                  ) : null}
                </>
              );
            })}
          </Space>
        </Radio.Group>
        {parameter === "solid-color" && !isValidHex ? (
          <p className={styles.customParameterError}>{t("upload.parameters.errors.hex_format")}</p>
        ) : null}
      </div>
    </div>
  );
};

export default BackgroundColor;

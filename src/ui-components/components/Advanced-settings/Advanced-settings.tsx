import React, { useEffect } from "react";
import { Collapse } from "antd";
import { CaretRightOutlined } from "@ant-design/icons";
const { Panel } = Collapse;
import styles from "./Advanced-settings.module.scss";
import CropArea from "../Crop-area";
import { useBodyPartDetection, useUpdateConfigChanges } from "../../smart-crop-components/jotai";
import { OpenInAppHelp } from "../icon/icon.composition";
import { ARTICLE_URL_ID } from "../../../common/Enums";
import LearnMore from "../LearnMore";
import { Checkbox } from "../checkbox";
import { useTranslation } from "react-i18next";
import { useFeature } from "../../../util/feature-flag";

const AdvancedSettings = () => {
  const { t } = useTranslation();

  const [bodyPartsDetection, setBodyPartsDetection] = useBodyPartDetection();
  // function to handle onclick on the body part detection checkbox
  const handleBodyPartDetection = () => {
    setBodyPartsDetection(!bodyPartsDetection);
  };

  const bodyPartsAppConfig = useFeature("features.body_part_detection");

  // This useeffect is checks if default value is undefined which it is on the first open of new automation.
  // After setting a value it does not update the bodypart state again
  useEffect(() => {
    if (bodyPartsDetection === undefined) {
      bodyPartsAppConfig.enable === false ? setBodyPartsDetection(false) : setBodyPartsDetection(true);
      bodyPartsAppConfig.display === false ? setBodyPartsDetection(false) : null;
    }
  }, [bodyPartsAppConfig]);

  return (
    <div className={styles.wrapper}>
      <Collapse
        bordered={false}
        expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 270 : 90} />}
        className={styles.collapse}
        expandIconPosition="right"
      >
        <Panel className={styles.panel} header={<div className={styles.panelHeading}>Advanced settings</div>} key="1">
          <CropArea />
          {bodyPartsAppConfig?.display && (
            <>
              {/*<div className={styles.label}>
                <div style={{ marginRight: "0.5rem" }}>{t("configuration.left_panel.body_part_detection.label")}</div>

              </div>
              <div className={styles.shortdescription}>
                {t("configuration.left_panel.body_part_detection.description")}
              </div>*/}
              <Checkbox
                className={styles.removeBg}
                text={t("configuration.left_panel.body_part_detection.checkbox_label")}
                onChange={handleBodyPartDetection}
                checked={bodyPartsDetection}
              />
              <OpenInAppHelp article={ARTICLE_URL_ID.BACK_ANGLE_FACE_DETECTION} />
            </>
          )}
        </Panel>
      </Collapse>
    </div>
  );
};

export default AdvancedSettings;

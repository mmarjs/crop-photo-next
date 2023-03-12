import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./review-settings.module.scss";
import { useCropMarker, useRemoveBgConfig, useSelectedSize } from "../../smart-crop-components/jotai";
import Edit from "../../../../public/images/edit.svg";
import { exists } from "i18next";
import { useRouter } from "next/router";
import { AUTOMATION_STATUS } from "../../../common/Enums";

const ReviewSettings = ({
  steppersLength,
  onEditCropMarker,
  onEditBgSettings,
  onEditOutputSizes
}: {
  steppersLength: number;
  onEditCropMarker: () => void;
  onEditBgSettings: () => void;
  onEditOutputSizes: () => void;
}) => {
  const router = useRouter();
  const { status } = router?.query;
  const { t } = useTranslation();
  const [cropMarkerAtom] = useCropMarker();
  const [removeBgConfigAtom] = useRemoveBgConfig();
  const [selectedSizeAtom] = useSelectedSize();
  const [cropMarkerSetting, setcropMarkerSetting] = useState("");
  const [bgArray, setBgArray] = useState<Array<string>>([]);

  useEffect(() => {
    if (removeBgConfigAtom.remove_background) {
      setBgArray(prev => [...prev, t("configuration.left_panel.remove_background.label")]);
      if (removeBgConfigAtom.transparency === 1) {
        setBgArray(prev => [...prev, t("configuration.left_panel.remove_background_options.transparent")]);
      } else if (removeBgConfigAtom.background_color && !removeBgConfigAtom.custom_background_image_paths) {
        setBgArray(prev => [...prev, removeBgConfigAtom.background_color]);
      } else if (
        removeBgConfigAtom.custom_background_image_paths &&
        removeBgConfigAtom.custom_background_image_paths.length > 0
      ) {
        setBgArray(prev => [...prev, t("configuration.left_panel.remove_background_options.background_image")]);
      }
    } else {
      setBgArray([]);
    }

    return () => {
      setBgArray([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [removeBgConfigAtom]);

  useEffect(() => {
    let labelKey = `configuration.left_panel.select_a_marker_dropdown.${cropMarkerAtom}`;
    let label = exists(labelKey) ? t(labelKey) : cropMarkerAtom;
    // console.log("cropMarkerAtom: " + cropMarkerAtom);
    setcropMarkerSetting(label);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropMarkerAtom]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.label}>{t("configuration.left_panel.review_settings")}</div>

      {router?.pathname !== "/remove-bg-resize" ? (
        <div className={styles.settingItem}>
          <div className={styles.title}>
            {t("configuration.left_panel.crop_marker.label")}
            {status === AUTOMATION_STATUS.COMPLETED || status === AUTOMATION_STATUS.RUNNING ? null : (
              <Edit onClick={onEditCropMarker} style={{ cursor: "pointer" }} />
            )}
          </div>
          <div className={styles.setting}>{cropMarkerSetting}</div>
        </div>
      ) : null}

      <div className={styles.settingItem}>
        <div className={styles.title}>
          {t("configuration.left_panel.bg_settings")}
          {status === AUTOMATION_STATUS.COMPLETED || status === AUTOMATION_STATUS.RUNNING ? null : (
            <Edit onClick={onEditBgSettings} style={{ cursor: "pointer" }} />
          )}
        </div>
        <div className={styles.setting}>
          {bgArray.length > 0 ? bgArray.map((value, index) => <div key={index}>{value}</div>) : <br></br>}
        </div>
      </div>

      <div className={styles.settingItem}>
        <div className={styles.title}>
          {t("configuration.left_panel.output_sizes")}
          {status === AUTOMATION_STATUS.COMPLETED || status === AUTOMATION_STATUS.RUNNING ? null : (
            <Edit onClick={onEditOutputSizes} style={{ cursor: "pointer" }} />
          )}
        </div>
        <div className={styles.setting}>
          {selectedSizeAtom.map((value, index) => (
            <div key={index}>{value}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewSettings;

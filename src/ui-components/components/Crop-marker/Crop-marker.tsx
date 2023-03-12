import React from "react";
import styles from "./Crop-marker.module.scss";
import Select from "antd/lib/select";
import { useTranslation } from "react-i18next";
import { useCropMarker } from "../../smart-crop-components/jotai";
import { AtomQueryStatus, useAssetDetails, useMarkerOptions } from "../../smart-crop-components/jotai/atomQueries";
import { useIntercom } from "react-use-intercom";
import { OpenInAppHelp } from "../icon/icon.composition";
import LearnMore from "../LearnMore";
import { ARTICLE_URL_ID } from "../../../common/Enums";
import {Logger} from "aws-amplify";

const dropdownStyle = {
  borderRadius: "0.5rem",
  boxShadow: "0px 12px 16px -8px rgba(6, 20, 37, 0.16)",
  border: "1px solid #EFF1F3"
};

const CropMarker = () => {
  const logger = new Logger("ui-components:components:Crop-marker");
  const { t } = useTranslation();
  const { Option } = Select;

  const [cropMarker, setCropMarker] = useCropMarker();
  const [assetDetail] = useAssetDetails();
  const [markerOptions, status] = useMarkerOptions();

  const { showArticle, show, update: updateIntercom } = useIntercom();
  logger.debug("markerOptions", markerOptions);
  const handleSelectChange = (value: string) => {
    setCropMarker(value);
  };
  return (
    <div className={styles.wrapper}>
      <div className={styles.label}>
        <div style={{ marginRight: "0.5rem" }}>{t("configuration.left_panel.crop_marker.label")}</div>
        <OpenInAppHelp article={123} />
      </div>
      <div className={styles.shortdescription}>
        {t("configuration.left_panel.crop_marker.short_desc")}
        {/* <Button
          // href="https://help.crop.photo/en/articles/6079897-a-step-by-step-guide-to-crop-photo#h_658ef13c5b"
          size="small"
          type="link"
          className={styles.learnMoreBtn}
          onClick={() => {
            showArticle(6079897);
          }}
        >
          <span className="bot-launch-what-is-crop-marker">{t("configuration.left_panel.crop_marker.link_text")}</span>
        </Button> */}
        <LearnMore article={ARTICLE_URL_ID.CROP_MARKER_URL as string} />
      </div>
      <Select
        placeholder={t("configuration.left_panel.select_a_marker_dropdown.prompt")}
        className={styles.dropdown}
        value={status === AtomQueryStatus.HAS_DATA ? cropMarker : ""}
        dropdownStyle={dropdownStyle}
        onChange={handleSelectChange}
        disabled={status === AtomQueryStatus.LOADING || status === AtomQueryStatus.HAS_ERROR}
        dropdownClassName={styles.dropdownList}
      >
        {status === AtomQueryStatus.HAS_DATA
          ? markerOptions?.map((option: any) => (
              <Option key={option.value} value={option?.value}>
                <span>{option?.label}</span>
              </Option>
            ))
          : null}
      </Select>
    </div>
  );
};

export default CropMarker;

import Select from "antd/lib/select";
import { isEmpty } from "lodash";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { connect, ConnectedProps } from "react-redux";
import { Dispatch } from "redux";
import { updateMarker } from "../../../../../redux/actions/smartcropActions";
import { SmartCropStructType } from "../../../../../redux/structs/smartcrop";
import { Button } from "antd";
import styles from "./crop-marker.module.scss";
import { useIntercom } from "react-use-intercom";
import { LabelValue } from "../../../../../common/Types";

const dropdownStyle = {
  borderRadius: "0.5rem",
  boxShadow: "0px 12px 16px -8px rgba(6, 20, 37, 0.16)",
  border: "1px solid #EFF1F3"
};

type PropsFromRedux = ConnectedProps<typeof connector>;

interface CropMarkerTypes extends PropsFromRedux {
  onChange: Function | any;
  marker: string;
  disabled: boolean;
  markerOptions: LabelValue[];
}

function CropMarker({ onChange, markerOptions, updateMarker, marker, disabled }: CropMarkerTypes) {
  const { showArticle, show, update: updateIntercom } = useIntercom();
  const { Option } = Select;
  const { t } = useTranslation();
  const [defaultValue, setDefaultValue] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!isEmpty(marker)) {
      setDefaultValue(marker);
    }
  }, [marker]);

  // useEffect(() => {
  //   updateIntercom({
  //     customLauncherSelector: ".bot-launch-what-is-crop-marker"
  //   });
  // }, []);

  const handleSelectChange = (value: string) => {
    onChange(value); //TODO: remove when smart cropping is finished and merged.
    updateMarker(value);
  };

  return (
    <div className={styles.cropMarkerWrapper}>
      <div className={styles.label}>{t("configuration.left_panel.crop_marker.label")}</div>
      <div className={styles.shortdescription}>
        {t("configuration.left_panel.crop_marker.short_desc")}
        <Button
          // href="https://help.crop.photo/en/articles/6079897-a-step-by-step-guide-to-crop-photo#h_658ef13c5b"
          size="small"
          type="link"
          className={styles.learnMoreBtn}
          onClick={() => {
            // show();
            // TODO: will remove for class name trigger to specific article
            showArticle(6079897);
          }}
        >
          {" "}
          <span className="bot-launch-what-is-crop-marker">{t("configuration.left_panel.crop_marker.link_text")}</span>
        </Button>
      </div>
      <Select
        placeholder={t("configuration.left_panel.select_a_marker_dropdown.prompt")}
        className={styles.dropdown}
        value={defaultValue}
        dropdownStyle={dropdownStyle}
        onChange={handleSelectChange}
        disabled={disabled}
        dropdownClassName={styles.dropdownList}
      >
        {markerOptions.map((option: any) => (
          <Option key={option.value} value={option?.value}>
            <span>{option?.label}</span>
          </Option>
        ))}
      </Select>
    </div>
  );
}

const mapStateToProps = (state: { smartcrop: SmartCropStructType }) => ({
  marker: state.smartcrop.currentMarker,
  markerOptions: state.smartcrop.markerOptions
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  updateMarker: (marker: string) => dispatch(updateMarker(marker))
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(CropMarker);

import React, { useEffect, useState, useMemo } from "react";
import Select from "antd/lib/select";
import Slider from "antd/lib/slider";
import { connect, ConnectedProps } from "react-redux";
import {
  updateSelectedImage,
  updateMarkerOptions,
  updateSelectedMarker,
  updateIsImageLoaded
} from "../../../../redux/actions/smartcropActions";
import { Button } from "../../button";

import styles from "./crop-footer.module.scss";
import { Dispatch } from "redux";
import { SmartCropStructType } from "../../../../redux/structs/smartcrop";
import { SelectedImage, OBJECT_TYPE } from "../../../../common/Types";
import { MarkerData } from "../../../../models/MarkerData";
import { CROP_TYPE } from "../smart-crop-config-constants";

type PropsFromRedux = ConnectedProps<typeof connector>;

const dropdownStyle = {
  borderRadius: "0.5rem",
  boxShadow: "0px 12px 16px -8px rgba(6, 20, 37, 0.16)",
  border: "0.5px solid #EFF1F3"
};

interface CropFooterType extends PropsFromRedux {
  zoom: number;
  setZoom: Function;
  markers?: MarkerData[];
  selectedMarker?: MarkerData | undefined;
  showMarkerDropDown: boolean;
  isImageLoaded: boolean;
  isSliding: boolean;
  setIsSliding: React.Dispatch<React.SetStateAction<boolean>>;
  selectedMarkerIndex: number;
  setSelectedMarkerIndex: Function;
  cropInfo: any;
}

const CropFooter = ({
  markers,
  setZoom,
  zoom,
  updateSelectedMarker,
  updateMarkerOptions,
  selectedMarker,
  selectedImage,
  updateSelectedImage,
  assets,
  imageIds,
  updateIsImageLoaded,
  isImageLoaded,
  isSliding,
  setIsSliding,
  selectedMarkerIndex,
  setSelectedMarkerIndex,
  cropInfo
}: CropFooterType) => {
  const [defaultZoomValue, setDefaultZoomValue] = useState(zoom);

  useEffect(() => {
    if (markers && markers?.length > 0) {
      const newMarker = markers[selectedMarkerIndex] as MarkerData;
      updateSelectedMarker(newMarker);
    }
  }, [selectedMarkerIndex, markers]);
  useEffect(() => {
    if (markers?.length === 1) {
      setSelectedMarkerIndex(0);
      updateSelectedMarker(markers[0]);
    }
  }, [markers, selectedMarker]);

  useEffect(() => {
    setDefaultZoomValue(zoom);
  }, [zoom]);

  const isLastItem = () => {
    return imageIds.indexOf(selectedImage.id) === imageIds.length - 1;
  };

  const isFirstItem = () => {
    return imageIds.indexOf(selectedImage.id) === 0;
  };

  const markerDropdownOptions = useMemo(() => {
    return markers?.map((e, i) => {
      return { label: `Marker ${i + 1}`, value: i };
    });
  }, [markers]);

  const nextButton = () => {
    updateIsImageLoaded(false);
    const nextIndex = imageIds.findIndex(id => id === selectedImage.id) + 1;
    if (nextIndex > 0) {
      const image = assets.getImageById(imageIds[nextIndex]);
      updateSelectedImage(image);
      setZoom(100);
    }
  };

  const prevButton = () => {
    updateIsImageLoaded(false);
    const prevIndex = imageIds.findIndex(id => id === selectedImage.id) - 1;
    if (prevIndex !== -1) {
      const image = assets.getImageById(imageIds[prevIndex]);
      updateSelectedImage(image);
      setZoom(100);
    }
  };

  console.log("test", cropInfo?.cropType, CROP_TYPE.CROP_AROUND, cropInfo?.cropType !== CROP_TYPE.CROP_AROUND);

  return (
    <div className={styles.footerWrapper}>
      <div className={styles.zoomSliderContainer}>
        <Slider
          className={styles.zoomslider}
          onChange={value => {
            setZoom(value);
            setIsSliding(true);
          }}
          onAfterChange={value => {
            setIsSliding(false);
          }}
          defaultValue={defaultZoomValue}
          value={defaultZoomValue}
          min={0}
          max={200}
          trackStyle={{ background: "#eff1f3" }}
          handleStyle={{ background: "#0038FF" }}
          disabled={!isImageLoaded}
        />
        <span className={styles.zoomsliderText}>{zoom}%</span>
      </div>

      <div className={styles.textContainer}>
        {cropInfo?.cropType !== CROP_TYPE.CROP_AROUND && (
          <div style={{ display: "inline-flex", alignItems: "center" }}>
            {markers && markers?.length > 1 ? (
              <span>
                <Select
                  options={markerDropdownOptions}
                  className={styles.dropdown}
                  placeholder="-"
                  value={selectedMarkerIndex}
                  onChange={index => {
                    setSelectedMarkerIndex(index);
                  }}
                  dropdownStyle={dropdownStyle}
                  disabled={!isImageLoaded}
                  dropdownClassName={styles.dropdownList}
                />
              </span>
            ) : null}
          </div>
        )}
      </div>
      <div className={styles.ArrowButtons}>
        <Button onClick={prevButton} size="md" icon={<PrevIcon />} disabled={isFirstItem() || !isImageLoaded} />
        <Button onClick={nextButton} size="md" icon={<NextIcon />} disabled={isLastItem() || !isImageLoaded} />
      </div>
    </div>
  );
};

export const PrevIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="7" height="12" fill="none" viewBox="0 0 7 12">
    <path
      fill="#061425"
      d="M.22 6.72A.75.75 0 010 6.19v-.38a.77.77 0 01.22-.53L5.36.15a.5.5 0 01.71 0l.71.71a.49.49 0 010 .7L2.33 6l4.45 4.44a.5.5 0 010 .71l-.71.7a.5.5 0 01-.71 0L.22 6.72z"
    ></path>
  </svg>
);

export const NextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="7" height="12" fill="none" viewBox="0 0 7 12">
    <path
      fill="#061425"
      d="M6.78 5.28c.14.14.22.331.22.53v.38a.77.77 0 01-.22.53l-5.14 5.13a.5.5 0 01-.71 0l-.71-.71a.49.49 0 010-.7L4.67 6 .22 1.56a.5.5 0 010-.71l.71-.7a.5.5 0 01.71 0l5.14 5.13z"
    ></path>
  </svg>
);

const mapStateToProps = (state: { smartcrop: SmartCropStructType }) => ({
  selectedImage: state.smartcrop.selectedImage,
  imageIds: state.smartcrop.imageIds,
  assets: state.smartcrop.assets,
  isImageLoaded: state.smartcrop.isImageLoaded
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  updateSelectedMarker: (marker: MarkerData) => dispatch(updateSelectedMarker(marker)),
  updateSelectedImage: (image: SelectedImage) => dispatch(updateSelectedImage(image)),
  updateMarkerOptions: (options: OBJECT_TYPE[]) => dispatch(updateMarkerOptions(options)),
  updateIsImageLoaded: (isLoaded: boolean) => dispatch(updateIsImageLoaded(isLoaded))
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(CropFooter);

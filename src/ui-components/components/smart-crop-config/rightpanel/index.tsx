import React, { useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import ImageViewer from "./image-viewer/image-viewer";
import CropFooter from "../crop-footer";
import { CROP_TYPE } from "../smart-crop-config-constants";

import styles from "./crop-config-rightpanel.module.scss";
import { MarkerData } from "../../../../models/MarkerData";

type PropsFromRedux = ConnectedProps<typeof connector>;

interface SmartCropConfigRightSidePanelProps extends PropsFromRedux {
  setCrop: Function;
  crop: any[];
  markers?: MarkerData[];
  setImageInfo: Function;
  cropInfo: any;
  imageInfo: any;
  setIsDrawing: Function;
  coordinateInfo: any;
  cropTypeMode: any;
}

function SmartCropConfigRightSidePanel({
  imageInfo,
  selectedMarker,
  markers,
  cropInfo,
  setCrop,
  crop,
  setImageInfo,
  setIsDrawing,
  selectedImage,
  cropTypeMode
}: SmartCropConfigRightSidePanelProps) {
  const [zoom, setZoom] = useState(100);
  const [isSliding, setIsSliding] = useState<boolean>(false);
  const [selectedMarkerIndex, setSelectedMarkerIndex] = useState<number>(0);

  return (
    <div className={styles.wrapper}>
      {selectedImage && (
        <ImageViewer
          markers={markers}
          zoom={zoom}
          crop={crop}
          setCrop={setCrop}
          imageInfo={imageInfo}
          setImageInfo={setImageInfo}
          cropInfo={cropInfo}
          setIsDrawing={setIsDrawing}
          selectedMarker={selectedMarker}
          cropTypeMode={cropTypeMode}
          isSliding={isSliding}
          selectedMarkerIndex={selectedMarkerIndex}
          setSelectedMarkerIndex={setSelectedMarkerIndex}
        />
      )}
      <CropFooter
        isSliding={isSliding}
        setIsSliding={setIsSliding}
        zoom={zoom}
        markers={markers}
        setZoom={setZoom}
        showMarkerDropDown={cropInfo.cropType === CROP_TYPE.CROP_FROM}
        selectedMarkerIndex={selectedMarkerIndex}
        setSelectedMarkerIndex={setSelectedMarkerIndex}
        cropInfo={cropInfo}
      />
    </div>
  );
}

const mapStateToProps = (state: any) => ({
  selectedMarker: state.smartcrop.selectedMarker,
  smartCropStatus: state.smartcrop.smartCropStatus,
  selectedImage: state.smartcrop.selectedImage
});

const connector = connect(mapStateToProps);

export default connector(SmartCropConfigRightSidePanel);

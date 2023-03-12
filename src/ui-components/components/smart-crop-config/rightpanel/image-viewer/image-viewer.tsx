// @ts-ignore
import React, { useState, useEffect, useRef } from "react";
import SmartCropCanvas from "../../../../smart-crop/smart-crop-canvas";
import { connect, ConnectedProps } from "react-redux";
import { Dispatch } from "redux";
import { SmartCropStructType } from "../../../../../redux/structs/smartcrop";
import { ImageSizeType } from "../../leftpanel/types";
import { percentageToPxConvert } from "../../smartCropUtil";

import styles from "./image-viewer.module.scss";
import { updateIsImageLoaded } from "../../../../../redux/actions/smartcropActions";
import { MarkerData } from "../../../../../models/MarkerData";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { CROP_IMAGE_VIEWER } from "../../../../utils/Constants";
import { useRouter } from "next/router";

type PropsFromRedux = ConnectedProps<typeof connector>;

export interface ImageViewerProps extends PropsFromRedux {
  src?: string;
  zoom: number;
  markers?: MarkerData[];
  crop: any;
  setCrop: Function;
  setImageInfo: Function;
  cropInfo: any;
  imageInfo: any;
  cropTypeMode: any;
  setIsDrawing: Function;
  selectedMarker: MarkerData | undefined;
  isSliding: boolean;
  selectedMarkerIndex: number | null | undefined;
  setSelectedMarkerIndex: Function;
}

const ImageViewer = ({
  selectedImage,
  zoom,
  markers,
  setImageInfo,
  imageInfo,
  cropInfo,
  cropTypeMode,
  updateIsImageLoaded,
  isImageLoaded,
  isSliding,
  selectedMarker,
  selectedMarkerIndex,
  setSelectedMarkerIndex
}: ImageViewerProps) => {
  const router = useRouter();
  const [imageSize, setImageSize] = useState<ImageSizeType>({
    width: 100,
    height: 100
  });
  const [imageZoomScale, setImageZoomScale] = useState<number>(1);
  const [renderedImageSize, setRenderedImageSize] = useState<any>({
    width: 100,
    height: 100
  });
  const [resizedImage, setResizedImage] = useState<any>("");

  const imageWrapperDiv = useRef<HTMLDivElement>(null);
  const renderedImage = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (selectedImage && imageWrapperDiv.current) {
      setImageSize({
        width: "auto",
        height: ((imageWrapperDiv.current?.clientHeight - 30) * zoom) / 100
      });
      setImageZoomScale(zoom / 100);
    }
  }, [zoom, imageWrapperDiv, renderedImage]);

  useEffect(() => {
    setImageInfo({
      width: renderedImage.current?.clientWidth,
      height: renderedImage.current?.clientHeight
    });
    setRenderedImageSize({
      width: renderedImage.current?.clientWidth,
      height: renderedImage.current?.clientHeight
    });
    setImageZoomScale(zoom / 100);
  }, [zoom]);

  const onImageOnLoad = () => {
    setImageInfo({
      width: renderedImage.current?.clientWidth,
      height: renderedImage.current?.clientHeight
    });
    setRenderedImageSize({
      width: renderedImage.current?.clientWidth,
      height: renderedImage.current?.clientHeight
    });
    updateIsImageLoaded(true);
  };

  const setResizeImage = (image: any) => {
    setResizedImage(image);
  };

  return (
    <>
      <div className={styles.previewButton}>Preview</div>
      <div className={styles.imageWrapper} ref={imageWrapperDiv}>
        <div className={styles.cropWrapper}>
          <div style={{ position: "relative" }}>
            {!isImageLoaded && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  width: "100%",
                  height: "100%",
                  background: "#eff1f3",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <div className={styles.projectSkeleton}>
                  <Spin
                    className={styles.Spinner}
                    indicator={<LoadingOutlined style={{ fontSize: 50, color: "#0038FF" }} spin />}
                  />
                  <span className={styles.Progress} />
                </div>
              </div>
            )}
            <img
              ref={renderedImage}
              src={selectedImage.url}
              height={imageSize.height}
              onLoad={onImageOnLoad}
              style={{
                position: "relative",
                top: CROP_IMAGE_VIEWER.TOP_OFFSET
              }}
            />
            <SmartCropCanvas
              imageURL={selectedImage.url}
              height={renderedImage.current?.clientHeight}
              width={renderedImage.current?.clientWidth}
              markers={markers as MarkerData[]}
              cropInfo={cropInfo}
              cropTypeMode={cropTypeMode}
              currentResizedImage={resizedImage}
              setResizeImage={setResizeImage}
              isImageLoaded={isImageLoaded}
              imageInfo={imageInfo}
              isSliding={isSliding}
              imageZoomScale={imageZoomScale}
              selectedMarker={selectedMarker}
              selectedMarkerIndex={selectedMarkerIndex}
              setSelectedMarkerIndex={setSelectedMarkerIndex}
            />
          </div>

          {isImageLoaded &&
            markers?.map((e: any, i: number) => (
              <div
                key={`Marker${i}`}
                className={styles.Marker}
                style={{
                  width: `${percentageToPxConvert(renderedImage.current?.clientWidth!, e.width)}px`,
                  height: `${percentageToPxConvert(renderedImage.current?.clientHeight!, e.height)}px`,
                  top: `${
                    percentageToPxConvert(renderedImage.current?.clientHeight!, e.y) + CROP_IMAGE_VIEWER.TOP_OFFSET
                  }px`,
                  left: `${percentageToPxConvert(renderedImage.current?.clientWidth!, e.x)}px`
                }}
              />
            ))}
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state: { smartcrop: SmartCropStructType }) => ({
  selectedImage: state.smartcrop.selectedImage,
  isImageLoaded: state.smartcrop.isImageLoaded
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  updateIsImageLoaded: (isEnabled: boolean) => dispatch(updateIsImageLoaded(isEnabled))
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(ImageViewer);

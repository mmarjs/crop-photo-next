/* eslint-disable @next/next/no-img-element */
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { MarkerData } from "../../../models/MarkerData";
import { percentageToPxConvert } from "../../components/smart-crop-config/smartCropUtil";
import SmartCropCanvas from "../../smart-crop/smart-crop-canvas";
import { CROP_IMAGE_VIEWER } from "../../utils/Constants";
import Header from "../Header";
import {
  useBackgroundColor,
  useCropArea,
  useCropAreaAround,
  useCropMarker,
  useCustomBackgroundPaths,
  useImageViewerParameter,
  usePreviewMode,
  useRemoveBackground,
  useTransparency,
  useUpdateCropInfo,
  useUpdateImageInfo,
  useUpdateImageSize,
  useUpdateMarkers,
  useUpdateSelectedMarker,
  useUpdateSelectedSampleImageStatus
} from "../jotai";
import { useGetSelectedSampleImage, useSmartCropAssets } from "../jotai/atomQueries";
import rightPanelStyles from "./RightPanel.module.scss";
import imageViewerStyles from "../../../ui-components/components/smart-crop-config/rightpanel/image-viewer/image-viewer.module.scss";
import { MODE } from "../../components/smart-crop-config/smart-crop-config-constants";
import { SampleCropImage } from "../jotai/atomTypes";
import { useRouter } from "next/router";
import { Logger, Storage } from "aws-amplify";
import { toast } from "../../components/toast";

export interface ImageViewerProps {
  isSliding: boolean;
  selectedMarkerIndex: number | null | undefined;
  setSelectedMarkerIndex: Function;
}

export default function ImageViewer({ isSliding, setSelectedMarkerIndex, selectedMarkerIndex }: ImageViewerProps) {
  const logger = new Logger("ui-components:smart-crop-components:RightPanel:ImageViewer");
  const router = useRouter();
  const { step } = router.query;
  const currentStep = Number(step);
  const [previewMode, setPreviewMode] = usePreviewMode();
  const [selectedImage] = useGetSelectedSampleImage();
  const [isImageLoaded, updateIsImageLoadingStatus] = useUpdateSelectedSampleImageStatus();
  const [imageSize, setImageSize] = useUpdateImageSize();
  const [imageZoomScale] = useState<number>(1);
  const [renderedImageSize, setRenderedImageSize] = useState<any>({
    width: 100,
    height: 100
  });
  const [resizedImage, setResizedImage] = useState<any>("");
  const [imageInfo, setImageInfo] = useUpdateImageInfo();
  const [cropInfo] = useUpdateCropInfo();
  const [cropMarker] = useCropMarker();
  const [markers, setMarkers] = useUpdateMarkers();
  const [smartCropAssets] = useSmartCropAssets();
  const [selectedMarker, updateSelectedMarker] = useUpdateSelectedMarker();
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const renderedImage = useRef<HTMLImageElement>(null);
  const [removeBackground] = useRemoveBackground();
  const [, updateCropArea] = useCropArea();
  const [, updateCropAreaAround] = useCropAreaAround();
  const [hexColor] = useBackgroundColor();
  const [isTransparent] = useTransparency();
  const [imageViewerParameter] = useImageViewerParameter();
  const [customBackgroundPaths] = useCustomBackgroundPaths();
  const [signedURLOfSelectedCustomBackgroundImage, setSignedURLOfSelectedCustomBackgroundIMage] = useState<string>();

  useEffect(() => {
    if (customBackgroundPaths && customBackgroundPaths.length > 0) {
      Storage.get(customBackgroundPaths[0], { customPrefix: { public: "" } })
        .then(setSignedURLOfSelectedCustomBackgroundIMage)
        .catch(error => {
          toast(error, "error");
        });
    }
  }, [customBackgroundPaths]);

  useEffect(() => {
    if (selectedImage && imageWrapperRef?.current) {
      setImageSize({
        width: "auto",
        height: ((imageWrapperRef.current?.clientHeight - 30) * 100) / 100
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageWrapperRef, renderedImage, selectedImage]);

  useEffect(() => {
    if (isImageLoaded) {
      let markers: MarkerData[] | undefined = [];
      if (smartCropAssets) {
        markers = smartCropAssets.getCoordinatesByMarker(cropMarker, selectedImage?.id as string);
      }
      updateSelectedMarker(markers[0]);
      setMarkers(markers);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropMarker, imageInfo, selectedImage, isImageLoaded]);

  const onImageOnLoad = () => {
    setImageInfo({
      width: renderedImage.current?.clientWidth,
      height: renderedImage.current?.clientHeight
    });
    setRenderedImageSize({
      width: renderedImage.current?.clientWidth,
      height: renderedImage.current?.clientHeight
    });
    const markers = smartCropAssets?.getCoordinatesByMarker(cropMarker, selectedImage?.id as string);
    setMarkers(markers as MarkerData[]);
    if (markers?.length === 1) {
      updateSelectedMarker(markers[0]);
    }
    updateIsImageLoadingStatus(true);
  };

  const setResizeImage = (image: any) => {
    setResizedImage(image);
  };

  const imageUrl = useMemo(() => {
    return removeBackground
      ? (selectedImage as SampleCropImage)?.removed_bg_signed_s3_url
      : selectedImage?.signed_s3_url;
  }, [removeBackground, selectedImage]);

  const isRemoveBgResize = router?.pathname === "/remove-bg-resize";

  let inlineStyles: InlineStyles = {
    top: CROP_IMAGE_VIEWER.TOP_OFFSET,
    opacity: !isImageLoaded ? 0 : 1,
    objectFit: "contain",
    background: "none",
    backgroundSize: "unset"
  };

  if (imageViewerParameter === "transparent") {
    inlineStyles = {
      ...inlineStyles,
      backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%),
      linear-gradient(135deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%),
      linear-gradient(135deg, transparent 75%, #ccc 75%)`,
      backgroundSize: "25px 25px",
      backgroundPosition: "0 0, 12.5px 0, 12.5px -12.5px, 0px 12.5px"
    };
  }

  if (imageViewerParameter === "white") {
    inlineStyles = {
      ...inlineStyles,
      background: "#fff"
    };
  }

  if (imageViewerParameter === "bg-image") {
    const selectedFile = customBackgroundPaths ? (customBackgroundPaths as any)[0] : null;
    if (selectedFile) {
      logger.debug("Selected file for custom bg image: ", signedURLOfSelectedCustomBackgroundImage);
      inlineStyles = {
        ...inlineStyles,
        background: `url(${signedURLOfSelectedCustomBackgroundImage}) no-repeat center / cover`,
        backgroundSize: "contain"
      };
    }
  }

  if (imageViewerParameter === "solid-color") {
    inlineStyles = {
      ...inlineStyles,
      background: hexColor as string
    };
  }

  return (
    <div className={rightPanelStyles.RightPanel}>
      <Header previewMode={previewMode} setPreviewMode={setPreviewMode} />
      {/* Image viewer */}
      <div className={rightPanelStyles.imageViewer}>
        <div className={rightPanelStyles.selectedSampleImageContainer}>
          <div className={imageViewerStyles.imageWrapper} ref={imageWrapperRef}>
            <div className={imageViewerStyles.cropWrapper}>
              <div style={{ position: "relative" }}>
                {!isImageLoaded ? (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      width: "100%",
                      height: imageSize.height,
                      background: "#eff1f3",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      zIndex: 100
                    }}
                  >
                    <div className={imageViewerStyles.projectSkeleton}>
                      <Spin
                        className={imageViewerStyles.Spinner}
                        indicator={<LoadingOutlined style={{ fontSize: 50, color: "#0038FF" }} spin />}
                      />
                      <span className={imageViewerStyles.Progress} />
                    </div>
                  </div>
                ) : null}
                <img
                  ref={renderedImage}
                  src={imageUrl}
                  height={imageSize.height}
                  onLoad={onImageOnLoad}
                  style={inlineStyles as CSSProperties}
                  alt="#"
                />
                <SmartCropCanvas
                  imageURL={imageUrl as string}
                  height={renderedImage.current?.clientHeight}
                  width={renderedImage.current?.clientWidth}
                  markers={markers}
                  cropInfo={cropInfo}
                  cropTypeMode={MODE.VIEW}
                  currentResizedImage={resizedImage}
                  setResizeImage={setResizeImage}
                  isImageLoaded={isImageLoaded}
                  imageInfo={imageInfo}
                  isSliding={isSliding}
                  imageZoomScale={imageZoomScale}
                  selectedMarker={selectedMarker}
                  selectedMarkerIndex={selectedMarkerIndex}
                  setSelectedMarkerIndex={setSelectedMarkerIndex}
                  updateUnrecogCropSize={updateCropArea}
                  updateCropAreaAround={updateCropAreaAround}
                  showCroppedImage={currentStep === 2}
                  bgColor={hexColor}
                  isTransparent={isTransparent !== 1}
                />
              </div>

              {isImageLoaded &&
                !isRemoveBgResize &&
                currentStep < 2 &&
                markers?.map((e: any, i: number) => (
                  <div
                    key={`Marker${i}`}
                    className={imageViewerStyles.Marker}
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
        </div>
      </div>
    </div>
  );
}

interface InlineStyles {
  top: number;
  opacity: number;
  objectFit: string;
  background?: string;
  backgroundSize?: string;
  backgrounRepeat?: string;
  backgroundImage?: string;
  backgroundPosition?: string;
}

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
// import { MarkerData } from "../../../models/MarkerData";
// import { percentageToPxConvert } from "../../components/smart-crop-config/smartCropUtil";
import MaskCanvas from "../../smart-editor-canvas/maskCanvas";
// import { CROP_IMAGE_VIEWER } from "../../utils/Constants";
import EraseHeader from "../Header/EraseHeader";
import {
  useBackgroundColor,
  // useCropMarker,
  useTransparency,
  // useUpdateImageInfo,
  // useUpdateImageSize,
  // useUpdateMarkers,
  // useUpdateSelectedMarker,
  // useUpdateSelectedSampleImageStatus,
  useCustomBackgroundPaths
} from "../jotai";
// import { useAutomationType, useGetSelectedSampleImage, useSmartCropAssets } from "../jotai/atomQueries";
import rightPanelStyles from "./RightEditPanel.module.scss";
// import imageViewerStyles from "../../../ui-components/components/smart-crop-config/rightpanel/image-viewer/image-viewer.module.scss";
import { useRouter } from "next/router";

export interface RightEditPanelProps {
  isSliding: boolean;
}

export default function RightEditPanel({ isSliding }: RightEditPanelProps) {
  const router = useRouter();
  // const { step } = router.query;
  // const currentStep = Number(step);
  // const [selectedImage] = useGetSelectedSampleImage();
  // const [isImageLoaded, updateIsImageLoadingStatus] = useUpdateSelectedSampleImageStatus();
  // const [imageSize, setImageSize] = useUpdateImageSize();
  // const [imageZoomScale] = useState<number>(1);
  // const [renderedImageSize, setRenderedImageSize] = useState<any>({
  //   width: 100,
  //   height: 100
  // });
  // const [resizedImage, setResizedImage] = useState<any>("");
  // const [imageInfo, setImageInfo] = useUpdateImageInfo();
  // const [cropMarker] = useCropMarker();
  // const [markers, setMarkers] = useUpdateMarkers();
  // const [smartCropAssets] = useSmartCropAssets();
  // const [selectedMarker, updateSelectedMarker] = useUpdateSelectedMarker();
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const renderedImage = useRef<HTMLImageElement>(null);
  const [hexColor] = useBackgroundColor();
  const [isTransparent] = useTransparency();
  const [customBgPath] = useCustomBackgroundPaths();

  // useEffect(() => {
  //   if (selectedImage && imageWrapperRef?.current) {
  //     setImageSize({
  //       width: "auto",
  //       height: ((imageWrapperRef.current?.clientHeight - 30) * 100) / 100
  //     });
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [imageWrapperRef, renderedImage, selectedImage]);

  // useEffect(() => {
  //   if (isImageLoaded) {
  //     let markers: MarkerData[] | undefined = [];
  //     if (smartCropAssets) {
  //       markers = smartCropAssets.getCoordinatesByMarker(cropMarker, selectedImage?.id as string);
  //     }
  //     updateSelectedMarker(markers[0]);
  //     setMarkers(markers);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [cropMarker, imageInfo, selectedImage, isImageLoaded]);

  // const onImageOnLoad = () => {
  //   setImageInfo({
  //     width: renderedImage.current?.clientWidth,
  //     height: renderedImage.current?.clientHeight
  //   });
  //   setRenderedImageSize({
  //     width: renderedImage.current?.clientWidth,
  //     height: renderedImage.current?.clientHeight
  //   });
  //   const markers = smartCropAssets?.getCoordinatesByMarker(cropMarker, selectedImage?.id as string);
  //   setMarkers(markers as MarkerData[]);
  //   if (markers?.length === 1) {
  //     updateSelectedMarker(markers[0]);
  //   }
  //   updateIsImageLoadingStatus(true);
  // };

  // const setResizeImage = (image: any) => {
  //   setResizedImage(image);
  // };

  // const isRemoveBgResize = router?.pathname === "/remove-bg-resize";
  return (
    <div className={rightPanelStyles.RightPanel}>
      <EraseHeader />
      {/* Image viewer */}
      <div className={rightPanelStyles.imageViewer}>
        <div className={rightPanelStyles.selectedSampleImageContainer}>
          <div className={rightPanelStyles.imageWrapper} ref={imageWrapperRef} style={{ backgroundColor: "#F7F8FC" }}>
            {/* <div className={imageViewerStyles.cropWrapper}> */}
            <div
              style={{ position: "relative", height: "100%", width: "100%" }}
              id="edit-canvas-container"
              ref={renderedImage}
            >
              <div style={{ display: "grid", justifyContent: "center" }}>
                <MaskCanvas
                  bgColor={hexColor}
                  isTransparent={isTransparent !== 1}
                  customBgPath={customBgPath as string[]}
                />
              </div>
            </div>

            {/* {isImageLoaded &&
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
              ))} */}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect } from "react";
import styles from "./smart-crop-canvas.module.scss";
import { CROP_TYPE, MODE } from "../../components/smart-crop-config/smart-crop-config-constants";
import { SmartCropUtil } from "../../../util/SmartCropUtil";
import { CropFromConfig } from "../../../models/CropFromConfig";
import { fabric } from "fabric"; // this also installed on your project
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";
import { MarkerData } from "../../../models/MarkerData";
import { CropType, CropSide, CropSideUtil } from "../../enums";
import { CropAroundConfig } from "../../../models/CropAroundConfig";
import { percentageToPxConvert } from "../../components/smart-crop-config/smartCropUtil";
import { CROP_IMAGE_VIEWER } from "../../utils/Constants";
import { RectangleShape } from "../../../models/RectangleShape";
import { CropSideValues } from "../../smart-crop-components/jotai/atomTypes";
import { SetStateAction } from "jotai";
import { useRouter } from "next/router";
import { useUpdateCropSize } from "../../smart-crop-components/jotai";
import { Logger } from "aws-amplify";

// type PropsFromRedux = ConnectedProps<typeof connector>;
interface SmartCropCanvasProps {
  height: any;
  width: any;
  imageURL: string;
  markers: MarkerData[];
  cropInfo: any;
  cropTypeMode: any;
  currentResizedImage: any;
  setResizeImage: Function;
  isImageLoaded: boolean;
  imageInfo: any;
  isSliding: boolean;
  imageZoomScale: number;
  selectedMarker: MarkerData | undefined;
  selectedMarkerIndex: number | null | undefined;
  setSelectedMarkerIndex: Function;
  updateUnrecogCropSize?: (update: SetStateAction<CropSideValues>) => void;
  updateCropAreaAround?: (update: SetStateAction<CropSideValues>) => void;
  showCroppedImage?: boolean;
  isTransparent?: boolean;
  bgColor?: string;
}

const SmartCropCanvas = ({
  height,
  width,
  imageURL,
  markers,
  cropInfo,
  cropTypeMode,
  isImageLoaded,
  imageInfo,
  isSliding,
  selectedMarker,
  selectedMarkerIndex,
  setSelectedMarkerIndex,
  updateUnrecogCropSize,
  updateCropAreaAround,
  showCroppedImage,
  isTransparent,
  bgColor
}: SmartCropCanvasProps) => {
  const { editor, onReady } = useFabricJSEditor();
  const router = useRouter();
  const [, updateCropSize] = useUpdateCropSize();
  const logger = new Logger("ui-components:smart-crop:SmartCropCanvas");
  let cropConfig =
    cropInfo.cropType == CROP_TYPE.CROP_FROM
      ? new CropFromConfig(cropInfo.isIncludeBoundingBox, cropInfo.cropSize, cropInfo.cropSide)
      : new CropAroundConfig(cropInfo?.cropPosition?.x, cropInfo?.cropPosition?.y, cropInfo.cropSize);
  let cropType: CropType = cropInfo.cropType === CROP_TYPE.CROP_AROUND ? CropType.AROUND : CropType.FROM;

  let smartCropConfig =
    markers.length > 0 ? new SmartCropUtil(cropType, cropConfig, width, height, markers as MarkerData[]) : undefined;
  let cropArea = smartCropConfig?.calculateCropArea() || [];

  useEffect(() => {
    if (cropTypeMode === MODE.VIEW) {
      drawCanvas();
    } else {
      clearCanvas();
    }

    return () => {
      clearCanvas();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    cropInfo,
    cropTypeMode,
    width,
    imageURL,
    isSliding,
    height,
    selectedMarker,
    selectedMarkerIndex,
    showCroppedImage,
    cropArea
  ]);

  useEffect(() => {
    if (editor?.canvas) {
      initEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor?.canvas, selectedMarker, cropInfo, cropTypeMode]);

  const isRemoveBgResize = router?.pathname === "/remove-bg-resize";
  const initEvents = () => {
    (editor?.canvas as any).__eventListeners = {};
    editor?.canvas.on("object:scaling", e => {
      const obj = e.target;
      // handleObjectScaling(obj);
    });

    //ToDO: Remove the border overlapping the crop controls
    editor?.canvas.on("after:render", function (e: fabric.IEvent) {
      if (isRemoveBgResize) return;
      const canvas = editor?.canvas as any;
      canvas.contextContainer.strokeStyle = cropInfo.cropType == CROP_TYPE.CROP_AROUND ? "#0038FF" : "transparent";
      canvas.contextContainer.lineWidth = "2";
      canvas.forEachObject(function (obj: fabric.Object) {
        logger.debug("obj", obj, canvas.getActiveObject(), obj === canvas.getActiveObject());
        if (obj !== canvas.getActiveObject()) {
          var bound = obj.getBoundingRect();
          canvas.contextContainer.strokeRect(bound.left, bound.top, bound.width, bound.height);
        }
      });
    });

    editor?.canvas.on("selection:cleared", (e: any) => {
      const currentObject = e?.deselected ? e?.deselected[0] : null;
      // handleObjectSelect(currentObject);
      editor?.canvas.setActiveObject(currentObject);
    });

    editor?.canvas.on("object:moving", (e: any) => {
      const currentObject = e.target;
      if (isRemoveBgResize) {
        currentObject.lockMovementX = true;
        currentObject.lockMovementY = true;
        return;
      }
      handleObjectMoving(currentObject);
    });

    editor?.canvas.on("selection:created", (e: any) => {
      if (isRemoveBgResize) return;
      const currentObject = e.selected ? e.selected[0] : null;
      handleObjectSelect(currentObject);
    });

    editor?.canvas.on("selection:updated", (e: any) => {
      const currentObject = e.selected ? e.selected[0] : null;
      handleObjectSelect(currentObject);
    });

    editor?.canvas.on("object:modified", (e: any) => {
      const currentObject = editor?.canvas.getActiveObject();
      if (isRemoveBgResize) {
        //@ts-ignore
        currentObject.lockMovementX = true;
        //@ts-ignore
        currentObject.lockMovementY = true;
        return;
      }
      handleObjectModified(currentObject);
    });
  };

  const handleObjectSelect = (obj: any) => {
    if (obj) {
      logger.debug("SelectedObject-", obj);
      obj.isSelected;
      setSelectedMarkerIndex(obj.objectMarkerIndex);
    }
  };

  // const handleObjectScaling = obj => {
  //   obj.setCoords();
  //   if (obj.left < obj.movingLimit.left) {
  //     obj.lockScalingX = true;
  //     obj.lockScalingY = true;
  //     resetScaledObjectLeft(obj);
  //   }
  //   if (obj.top < obj.movingLimit.top) {
  //     obj.lockScalingX = true;
  //     obj.lockScalingY = true;
  //     resetScaledObjectTop(obj);
  //   }
  //   if (obj.left + obj.getBoundingRect().width > obj.movingLimit.right) {
  //     obj.lockScalingX = true;
  //     obj.lockScalingY = true;
  //     resetScaledObjectRight(obj);
  //   }
  //   if (obj.top + obj.getBoundingRect().height > obj.movingLimit.bottom) {
  //     obj.lockScalingX = true;
  //     obj.lockScalingY = true;
  //     resetScaledObjectBottom(obj);
  //   }
  // };

  // const resetScaledObjectTop = obj => {
  //   obj.height = (obj.getBoundingRect().height - Math.abs(obj.top - obj.movingLimit.top)) / obj.scaleY;
  //   obj.top = Math.max(obj.top, obj.movingLimit.top);
  //   obj.setCoords();
  //   obj.canvas.renderAll();
  // };
  // const resetScaledObjectLeft = obj => {
  //   obj.width = (obj.getBoundingRect().width - Math.abs(obj.left - obj.movingLimit.left)) / obj.scaleX;
  //   obj.left = Math.max(obj.left, obj.movingLimit.left);
  //   obj.setCoords();
  //   obj.canvas.renderAll();
  // };
  // const resetScaledObjectRight = obj => {
  //   obj.width =
  //     (obj.getBoundingRect().width -
  //       1 -
  //       Math.abs(obj.left - (obj.movingLimit.right - obj.getBoundingRect().width + obj.left - obj.left))) /
  //     obj.scaleX;
  //   obj.setCoords();
  //   obj.canvas.renderAll();
  // };
  // const resetScaledObjectBottom = obj => {
  //   obj.height =
  //     (obj.getBoundingRect().height -
  //       1 -
  //       Math.abs(obj.top - (obj.movingLimit.bottom - obj.getBoundingRect().height + obj.top - obj.top))) /
  //     obj.scaleY;
  //   obj.setCoords();
  //   obj.canvas.renderAll();
  // };

  const handleObjectMoving = (obj: any) => {
    if (obj && !isRemoveBgResize) {
      obj.setCoords();
      obj.movingLimitFunction(obj);
    }
  };

  const handleObjectMovingCropFrom = (obj: any) => {
    // top-left  corner
    if (obj.getBoundingRect().top < obj.movingLimit.top || obj.getBoundingRect().left < obj.movingLimit.left) {
      obj.top = Math.max(obj.top, obj.movingLimit.top);
      obj.left = Math.max(obj.left, obj.movingLimit.left);
    }
    // bot-right corner
    if (
      obj.getBoundingRect().top + obj.getBoundingRect().height > obj.movingLimit.bottom ||
      obj.getBoundingRect().left + obj.getBoundingRect().width > obj.movingLimit.right
    ) {
      obj.top = Math.min(
        obj.top,
        obj.movingLimit.bottom - obj.getBoundingRect().height + obj.top - obj.getBoundingRect().top
      );
      obj.left = Math.min(
        obj.left,
        obj.movingLimit.right - obj.getBoundingRect().width + obj.left - obj.getBoundingRect().left
      );
    }
  };

  const handleObjectMovingCropAround = (obj: any) => {};

  const handleObjectModified = (obj: any) => {
    logger.debug("handleObjectModified obj", obj);
    updateLeftPanel(obj);
  };

  const updateLeftPanel = (obj: any) => {
    const smartCropConfig = new SmartCropUtil(cropType, cropConfig, width, height, markers as MarkerData[]);
    const updatedCropSize = smartCropConfig?.giveCropSideValuesFromDrag(
      obj.left - CROP_IMAGE_VIEWER.LEFT_OFFSET,
      obj.left - CROP_IMAGE_VIEWER.LEFT_OFFSET + obj.width * obj.scaleX,
      obj.top - CROP_IMAGE_VIEWER.TOP_OFFSET,
      obj.top - CROP_IMAGE_VIEWER.TOP_OFFSET + obj.height * obj.scaleY,
      obj.objectMarker
    );
    updateCropSize({
      top: limitCropSize(updatedCropSize.get(CropSide.TOP) as number),
      bottom: limitCropSize(updatedCropSize.get(CropSide.BOTTOM) as number),
      left: limitCropSize(updatedCropSize.get(CropSide.LEFT) as number),
      right: limitCropSize(updatedCropSize.get(CropSide.RIGHT) as number)
    });
    !!updateUnrecogCropSize &&
      updateUnrecogCropSize({
        top: limitCropSize(updatedCropSize.get(CropSide.TOP) as number),
        bottom: limitCropSize(updatedCropSize.get(CropSide.BOTTOM) as number),
        left: limitCropSize(updatedCropSize.get(CropSide.LEFT) as number),
        right: limitCropSize(updatedCropSize.get(CropSide.RIGHT) as number)
      });

    !!updateCropAreaAround &&
      updateCropAreaAround({
        top: limitCropSize(updatedCropSize.get(CropSide.TOP) as number),
        bottom: limitCropSize(updatedCropSize.get(CropSide.BOTTOM) as number),
        left: limitCropSize(updatedCropSize.get(CropSide.LEFT) as number),
        right: limitCropSize(updatedCropSize.get(CropSide.RIGHT) as number)
      });
  };

  const limitCropSize = (value: number) => {
    if (value < 0) {
      return 0;
    } else if (value > 100) {
      return 100;
    }
    return value;
  };

  const addCroppedImageOnCanvas = (cropBox: RectangleShape, index: number) => {
    const canvas = editor?.canvas;
    const rectLeft = cropBox.getX() + CROP_IMAGE_VIEWER.LEFT_OFFSET;
    const rectTop = cropBox.getY() + CROP_IMAGE_VIEWER.TOP_OFFSET;
    const rect = new fabric.Rect({
      left: rectLeft,
      top: rectTop,
      width: cropBox.getWidth(),
      height: cropBox.getHeight(),
      cornerSize: 12,
      cornerStrokeColor: "#0038FF",
      cornerColor: "#FFF",
      borderColor: "#0038FF",
      transparentCorners: false,
      //@ts-ignore
      movingLimit: getMovingLimit(),
      movingLimitFunction: getMovingLimitFunction(),
      objectMarkerIndex: index,
      objectMarker: markers?.[index],
      globalCompositeOperation: "destination-out",
      borderScaleFactor: 2,
      subTargetCheck: true
    });
    canvas?.add(rect);

    const image = new Image();
    image.src = imageURL;
    image.style.backgroundColor = isTransparent && !!bgColor ? bgColor : "#FFFFFF";
    // image.onload = () => {
    //   const img = new fabric.Image(image);
    //   img.scaleToWidth(cropBox.getWidth());
    //   img.scaleToHeight(cropBox.getHeight());
    //   //@ts-ignore
    //   img.cropX = rectLeft / img.scaleX;
    //   //@ts-ignore
    //   img.cropY = rectTop / img.scaleY;
    //   img.setCoords();
    //   canvas?.add(img);
    //   canvas?.renderAll();
    //   const canvasWidth = canvas?.getWidth() as number;
    //   const canvasHeight = canvas?.getHeight() as number;
    //   const imgHeight = img?.height as number;
    //   const imgScaleY = img?.scaleY as number;
    //   const imgScaleHeight = canvasHeight / (imgScaleY * imgHeight - rectTop);
    //   canvas?.setWidth(canvasWidth * imgScaleHeight);
    //   canvas?.setZoom(imgScaleHeight);
    //   img.setCoords();
    // };

    image.onload = () => {
      const img = new fabric.Image(image);
      img.scaleToWidth(cropBox.getWidth());
      //@ts-ignore
      img.cropX = cropBox.getX() / img.scaleX;
      //@ts-ignore
      img.cropY = cropBox.getY() / img.scaleY;
      img.setCoords();
      canvas?.add(img);
      //@ts-ignore
      const imgScaleHeight = canvas.height / (img.scaleY * img.height - cropBox.getY());
      //@ts-ignore
      canvas?.setWidth(canvas?.width * imgScaleHeight);
      canvas?.setZoom(imgScaleHeight);
      canvas?.renderAll();
    };
  };

  const addCropBox = (markerIndex: number) => {
    if (!!cropArea) {
      if (cropInfo.cropType == CROP_TYPE.CROP_AROUND) {
        markers?.map((e: any, i: number) => addCropBoxOnCanvas(cropArea[i], i));
      } else {
        addCropBoxOnCanvas(cropArea[markerIndex], markerIndex);
      }
    }
  };

  const changeMarker = () => {};

  const addCropBoxOnCanvas = (cropBox: RectangleShape, index: number) => {
    if (cropBox) {
      const canvas = editor?.canvas;
      canvas?.setZoom(1);
      const rect = new fabric.Rect({
        left: cropBox.getX() + CROP_IMAGE_VIEWER.LEFT_OFFSET,
        top: cropBox.getY() + CROP_IMAGE_VIEWER.TOP_OFFSET,
        width: cropBox.getWidth(),
        height: cropBox.getHeight(),
        cornerSize: !isRemoveBgResize ? 12 : 0,
        cornerStrokeColor: !isRemoveBgResize ? "#0038FF" : "transparent",
        cornerColor: !isRemoveBgResize ? "#FFF" : "transparent",
        borderColor: !isRemoveBgResize ? "#0038FF" : "transparent",
        transparentCorners: isRemoveBgResize,
        //@ts-ignore
        movingLimit: !isRemoveBgResize ? getMovingLimit() : null,
        movingLimitFunction: !isRemoveBgResize ? getMovingLimitFunction() : null,
        objectMarkerIndex: index,
        objectMarker: markers?.[index],
        globalCompositeOperation: "destination-out",
        borderScaleFactor: 2,
        subTargetCheck: !isRemoveBgResize
      });
      canvas?.add(rect);

      rect.setControlsVisibility({ mtr: false });
      if (!isRemoveBgResize) {
        if (cropInfo.cropType === CROP_TYPE.CROP_AROUND && !!markers && markers?.length > 1) {
          if (index == selectedMarkerIndex) {
            editor?.canvas.setActiveObject(rect);
          }
        } else {
          editor?.canvas.setActiveObject(rect);
        }
      }
    }
  };

  const getMovingLimit = () => {
    if (cropInfo.cropType == CROP_TYPE.CROP_AROUND) {
      return getMovingLimitCropAround();
    } else {
      return getMovingLimitCropFrom();
    }
  };

  const getMovingLimitCropFrom = () => {
    const markerIndex = selectedMarkerIndex || 0;
    let top = 0,
      right = editor?.canvas.width,
      bottom = editor?.canvas.height,
      left = 0;

    const cropSide = CropSideUtil.parse(cropInfo.cropSide);
    switch (cropSide) {
      case CropSide.TOP:
        bottom = (cropConfig as CropFromConfig)?.isIncludeMarkersBoundary()
          ? percentageToPxConvert(imageInfo.height, markers[markerIndex].getY() + markers[markerIndex].getHeight())
          : percentageToPxConvert(imageInfo.height, markers[markerIndex].getY());
        break;
      case CropSide.RIGHT:
        left = (cropConfig as CropFromConfig)?.isIncludeMarkersBoundary()
          ? percentageToPxConvert(imageInfo.width, markers[markerIndex].getY())
          : percentageToPxConvert(imageInfo.width, markers[markerIndex].getX()) +
            percentageToPxConvert(imageInfo.width, markers[markerIndex].getWidth());
        break;
      case CropSide.BOTTOM:
        top = (cropConfig as CropFromConfig)?.isIncludeMarkersBoundary()
          ? percentageToPxConvert(imageInfo.height, markers[markerIndex].getY())
          : percentageToPxConvert(imageInfo.height, markers[markerIndex].getY()) +
            percentageToPxConvert(imageInfo.height, markers[markerIndex].getHeight());
        break;
      case CropSide.LEFT:
        right = (cropConfig as CropFromConfig)?.isIncludeMarkersBoundary()
          ? percentageToPxConvert(imageInfo.width, markers[markerIndex].getX()) +
            percentageToPxConvert(imageInfo.width, markers[markerIndex].getWidth())
          : percentageToPxConvert(imageInfo.width, markers[markerIndex].getX());
        break;
    }

    return { top: top, right: right, bottom: bottom, left: left };
  };

  const getMovingLimitCropAround = () => {
    const markerIndex = selectedMarkerIndex || 0;
    let top = 0,
      right = editor?.canvas.width,
      bottom = editor?.canvas.height,
      left = 0;
    return { top: top, right: right, bottom: bottom, left: left };
  };

  const getMovingLimitFunction = () => {
    if (cropInfo.cropType == CROP_TYPE.CROP_AROUND) {
      return handleObjectMovingCropAround;
    } else {
      return handleObjectMovingCropFrom;
    }
  };

  const clearCanvas = () => {
    if (editor?.canvas) {
      editor?.canvas.clear();
    }
  };

  const drawCanvas = () => {
    editor?.canvas.clear();
    if (isImageLoaded && !isSliding) {
      editor?.canvas?.setWidth(width + 2 * CROP_IMAGE_VIEWER.LEFT_OFFSET);
      editor?.canvas?.setHeight(height + 2 * CROP_IMAGE_VIEWER.TOP_OFFSET);
      const markerIndex = selectedMarkerIndex || 0;
      const overlay = new fabric.Rect({
        left: CROP_IMAGE_VIEWER.LEFT_OFFSET,
        top: CROP_IMAGE_VIEWER.TOP_OFFSET,
        width: width,
        height: height,
        fill: "#061425",
        opacity: 0.7,
        selectable: false,
        globalCompositeOperation: "source-over"
      });
      if (!isRemoveBgResize) {
        editor?.canvas.add(overlay);
      }
      addCropBox(markerIndex);

      // if (showCroppedImage) {
      //   addCroppedImageOnCanvas(cropArea[markerIndex], markerIndex);
      // } else {
      //   const overlay = new fabric.Rect({
      //     left: CROP_IMAGE_VIEWER.LEFT_OFFSET,
      //     top: CROP_IMAGE_VIEWER.TOP_OFFSET,
      //     width: width,
      //     height: height,
      //     fill: "#061425",
      //     opacity: 0.7,
      //     selectable: false,
      //     globalCompositeOperation: "source-over"
      //   });
      //   editor?.canvas.add(overlay);
      //   addCropBox(markerIndex);
      // }
    }
  };

  return (
    <>
      <FabricJSCanvas className={styles.sampleCanvas} onReady={onReady} />
    </>
  );
};

// const mapStateToProps = (state: { smartcrop: SmartCropStructType }) => ({
//   cropSize: state.smartcrop.cropSize
// });

// const mapDispatchToProps = (dispatch: Dispatch) => ({
//   updateCropSize: (size: OBJECT_TYPE) => dispatch(updateCropSize(size))
// });

// const connector = connect(mapStateToProps, mapDispatchToProps);

export default SmartCropCanvas;

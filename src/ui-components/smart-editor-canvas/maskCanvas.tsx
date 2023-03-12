import styles from "./smart-editor-canvas.module.scss";
import { useEffect, useState } from "react";
import { Storage } from "aws-amplify";
import { fabric } from "fabric";
import { Spin, Modal } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import SmartEditorCanvas from "./mainCanvas";

import "../utils/EraserBrush";

import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";
import {
  useBrushType,
  useCursorSize,
  useResetEdit,
  useUndoEdit,
  useRedoEdit,
  useZoomInHandler,
  useZoomOutHandler,
  useZoomValue,
  useIsEditSave,
  useIsOnLargePreview,
  useLargePreviewData,
  useUpdateLatestJobId,
  useEditImage,
  useIsEdited
} from "../smart-crop-components/jotai";
import API from "../../util/web/api";
import { IEvent } from "fabric/fabric-impl";

interface MaskCanvasProps {
  isTransparent?: boolean;
  bgColor?: string;
  customBgPath: string[];
}

let stateStack: string[]; //undo stack
let redoStack: string[]; //redo stack
let maxCount: number = 100; //We keep 100 items in the stacks at any time.
let maskImage: fabric.Image;

const MaskCanvas = ({ isTransparent, bgColor, customBgPath }: MaskCanvasProps) => {
  const { editor, onReady } = useFabricJSEditor();
  const router = useRouter();
  const { automationId } = router?.query;
  const [brushType, setBrushType] = useBrushType();
  const [cursorSize] = useCursorSize();
  const [resetEdit] = useResetEdit();
  const [undoEdit] = useUndoEdit();
  const [redoEdit] = useRedoEdit();
  const [zoomInHandler] = useZoomInHandler();
  const [zoomOutHandler] = useZoomOutHandler();
  const [zoomValue, setZoomValue] = useZoomValue();
  const [stopRender, setStopRender] = useState(false);
  const [isEditSave, setIsEditSave] = useIsEditSave();
  const [isTrImgLoading, setIsTrImgLoading] = useState(true);
  const [isShowSaveModal, setIsShowSaveModal] = useState(false);
  const [, setIsOnLargePreview] = useIsOnLargePreview();
  const [, updateLargePreview] = useLargePreviewData();
  const [editImageAtom] = useEditImage();
  const [latestJobId] = useUpdateLatestJobId();
  const [, setIsEdited] = useIsEdited();

  const imageURL: string | undefined = editImageAtom.croppedSignedUrl;
  const originalFileName: string | undefined = editImageAtom.originalFileName;
  const imgId: string | undefined = editImageAtom?.cropId;
  const imgName: string | undefined = editImageAtom.imgName;
  const center = editor?.canvas?.getCenter();

  let isDrawing = false;

  useEffect(() => {
    redoStack = [];
    stateStack = [];
    setBrushType(2);
  }, []);
  //init backgroundColor and initialstate of undo/redo stack after transparent image is loaded.
  useEffect(() => {
    if (!editor || !fabric) {
      return;
    }
    if (!isTrImgLoading) {
      editor?.canvas.setBackgroundColor("black", () => {});
      stateStack.push(editor.canvas.toDataURL());
      editor.canvas.setViewportTransform(editor.canvas.viewportTransform as number[]);
    }
  }, [isTrImgLoading]);
  //set brushtype of canvas when user change the brush type.
  useEffect(() => {
    if (!editor || !fabric || isTrImgLoading) {
      return;
    }
    setStopRender(true);
    switch (brushType) {
      case 1:
        //@ts-ignore
        editor.canvas.freeDrawingBrush = new fabric.PencilBrush(editor.canvas);
        editor.canvas.freeDrawingBrush.color = "black";
        //@ts-ignore
        editor?.canvas.freeDrawingBrush.width = parseInt(cursorSize / zoomValue, 10);
        editor.canvas.isDrawingMode = true;
        break;
      case 0:
        //@ts-ignore
        editor.canvas.freeDrawingBrush = new fabric.PencilBrush(editor.canvas);
        editor.canvas.freeDrawingBrush.color = "white";
        //@ts-ignore
        editor?.canvas.freeDrawingBrush.width = parseInt(cursorSize / zoomValue, 10);
        editor.canvas.isDrawingMode = true;
        break;
      default:
        break;
    }
  }, [brushType, cursorSize]);
  // set brushSize dynamically.
  useEffect(() => {
    // @ts-ignore
    editor?.canvas.freeDrawingBrush.width = parseInt(cursorSize / zoomValue, 10);
  }, [zoomInHandler, zoomOutHandler, cursorSize, brushType, zoomValue]);
  // call restore function when restore button is clicked.
  useEffect(() => {
    if (!editor || !fabric) {
      return;
    }
    restore();
  }, [resetEdit]);
  // call undo function when undo button is clicked
  useEffect(() => {
    if (!editor || !fabric) {
      return;
    }
    maskUndo();
  }, [undoEdit]);
  // call redo function when redo button is clicked.
  useEffect(() => {
    if (!editor || !fabric) {
      return;
    }
    maskRedo();
  }, [redoEdit]);
  // call zoom in function when zoom in button clicked.
  useEffect(() => {
    if (!editor || !fabric) {
      return;
    }
    setZoom(0.1);
  }, [zoomInHandler]);
  // call zoom out function when zoom out button clicked.
  useEffect(() => {
    if (!editor || !fabric) {
      return;
    }
    setZoom(-0.1);
  }, [zoomOutHandler]);
  // zoom in/out when zoomValue is changed.
  useEffect(() => {
    if (!editor || !fabric) {
      return;
    }
    editor?.canvas?.zoomToPoint({ x: center?.left as number, y: center?.top as number }, zoomValue);
  }, [zoomValue]);
  //upload edited image when save button is clicked.
  useEffect(() => {
    if (!editor || !fabric) {
      return;
    }
    if (isEditSave) {
      setIsShowSaveModal(true);
      editor?.canvas?.zoomToPoint({ x: center?.left as number, y: center?.top as number }, 1);
      saveEditedImage();
      setIsEditSave(false);
    }
  }, [isEditSave]);
  // add images to the canvas from urls
  const addImages = () => {
    if (!editor || !fabric || stopRender) {
      return;
    }
    setStopRender(true);

    if (editImageAtom.transparentImgUrl) {
      fabric.textureSize = 8192;
      const image = new Image();
      image.src = editImageAtom.transparentImgUrl as string;
      image.crossOrigin = "anonymous";

      image.onload = () => {
        maskImage = new fabric.Image(image);
        maskImage.filters = [new fabric.Image.filters.BlendColor({ color: "white", mode: "add", alpha: 1 })];
        maskImage.scaleToHeight(window.innerHeight - 75);
        maskImage.applyFilters();
        editor.canvas.add(maskImage);
        editor.canvas?.setWidth((maskImage?.width as number) * (maskImage?.scaleX as number));
        editor.canvas?.setHeight(window.innerHeight - 75);
        maskImage.viewportCenterH();
        setIsTrImgLoading(false);
      };
    } else {
      setIsTrImgLoading(false);
    }
  };
  // call addImages() when initial loading.
  useEffect(() => {
    if (!editor || !fabric) {
      return;
    }
    addImages();
  }, [editor?.canvas.backgroundImage]);
  // save canvas state every time mouse up.
  const saveMaskState = () => {
    setIsEdited(true);
    if (stateStack.length === maxCount) {
      stateStack.shift();
    }

    if (editor?.canvas.toDataURL()) {
      stateStack.push(editor?.canvas.toDataURL());
      editor.canvas.setViewportTransform(editor.canvas.viewportTransform as number[]);
    }
  };
  // undo state function
  const maskUndo = () => {
    if (isTrImgLoading) {
      return;
    }
    if (stateStack.length > 1) {
      let currentState: string | undefined = stateStack.pop();
      redoStack.push(currentState as string);
      applyState(stateStack[stateStack.length - 1]);
    }
  }; 
  // redo state function
  const maskRedo = () => {
    if (isTrImgLoading) {
      return;
    }
    if (redoStack.length > 0) {
      applyState(redoStack[redoStack.length - 1]);
      let currentState: string | undefined = redoStack.pop();
      stateStack.push(currentState as string);
    }
  };
  // restore initialstate function
  const restore = () => {
    if (isTrImgLoading) {
      return;
    }
    setIsEdited(false);
    let initialState = stateStack[0];
    applyState(initialState);
    stateStack = [];
    redoStack = [];
    stateStack.push(initialState);
    setBrushType(brushType);
  };
  // apply the state to canvas when undo, redo, restore
  const applyState = (state: string) => {
    if (!editor || !fabric || isTrImgLoading) {
      return;
    }
    if (editor.canvas.getContext()) {
      editor?.canvas.clear();
      if (state && editImageAtom.transparentImgUrl)
        fabric.Image.fromURL(
          state,
          (image: any) => {
            image.set({
              selectable: false,
              evented: false
            });
            image.scaleToHeight(window.innerHeight - 75);
            editor?.canvas.add(image);
            editor?.canvas?.setWidth((image?.width as number) * (image?.scaleX as number));
            editor?.canvas?.setHeight(window.innerHeight - 75);
            image.viewportCenterH();
          },
          { crossOrigin: "anonymous" }
        );
    }
  };
  // fire on Mousedown event when the mousedown event occur on maincanvas.
  function onMouseDown(opt: IEvent<MouseEvent>) {
    isDrawing = true;
    //@ts-ignore
    editor?.canvas.freeDrawingBrush.onMouseDown(opt.absolutePointer, opt);
  }
  // fire on MouseUp event when the MouseUp event occur on maincanvas.
  function onMouseUp(opt: IEvent<MouseEvent>) {
    isDrawing = false;
    if(opt.e.type === "mouseup"){
      // @ts-ignore
      editor?.canvas.freeDrawingBrush.onMouseUp(opt);
    }else if(opt.e.type === "touchend"){
      // @ts-ignore
      editor?.canvas.freeDrawingBrush._onTouchEnd(opt);
      // let e = new MouseEvent("mouseup", opt.e)
      // let point = editor?.canvas.getPointer(opt.e)
      // //@ts-ignore
      // editor?.canvas.freeDrawingBrush.onMouseUp({
      //   absolutePointer: opt.absolutePointer,
      //   button: opt.button,
      //   currentSubTargets: opt.currentSubTargets,
      //   currentTarget: opt.currentTarget,
      //   e: e,
      //   isClick: opt.isClick,
      //   pointer: point,
      //   subTargets: opt.subTargets,
      //   target: opt.target,
      //   transform: opt.transform
      // });
    }
    // let point = editor?.canvas.getPointer(opt.e)
  }
  // fire on Mousemove event when the Mousemove event occur on maincanvas.
  function drawRealTime(opt: IEvent<MouseEvent>, pointer: any) {
    if (isDrawing) {
      //@ts-ignore
      editor?.canvas.freeDrawingBrush.onMouseMove(pointer, opt);
    }
  }
  // zoom function
  const setZoom = (zoom: any, point: any = { x: center?.left, y: center?.top }) => {
    if (isTrImgLoading) {
      return;
    }
    if (editor?.canvas.getContext()) {
      var newZoom = editor?.canvas?.getZoom() + zoom;
      if (newZoom > 10) newZoom = 10;
      if (newZoom < 0.1) newZoom = 0.1;
      setZoomValue(newZoom);

      editor?.canvas?.zoomToPoint(point, newZoom);
      if (newZoom === 1) {
        //@ts-ignore
        editor?.canvas.viewportTransform[4] = 0;
        //@ts-ignore
        editor?.canvas.viewportTransform[5] = 0;
      }
    }
  };
  // convert dataUrl to file.
  const dataURLtoFile = (dataurl: string, filename: string) => {
    var arr = dataurl.split(","),
      //@ts-ignore
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  };
  // save edited image to file from canvas
  const saveEditedImage = async () => {
    const originSize = { width: editor?.canvas.getWidth(), height: editor?.canvas.getHeight() };
    const dimension = editImageAtom.dimension;
    editor?.canvas.setWidth(dimension?.width as number);
    editor?.canvas.setHeight(dimension?.height as number);
    editor?.canvas.setZoom((dimension?.height as number) / (window.innerHeight - 75));
    editor?.canvas.setBackgroundColor("black", () => {});
    const base64 = editor?.canvas.toDataURL({ format: "png", quality: 1 });
    editor?.canvas.setHeight(originSize.height as number);
    editor?.canvas.setWidth(originSize.width as number);
    setZoomValue(1)
    editor?.canvas.setZoom(1);
    //download mask image to local
    const link = document.createElement("a");
    // @ts-ignore
    link.href = base64;
    link.download = `mask_image.png`;
    link.click();
    //upload mask image to s3 path
    // if (originalFileName) {
    //   let file = dataURLtoFile(base64 as string, originalFileName.replace(".png", "-mask.png"));
    //   uploadEditedImg(file);
    // }
  };
  //upload file to s3 path
  const uploadEditedImg = async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const config = {
        progressCallback: handleUploadProgress,
        completeCallback: handleCompleteUpload,
        errorCallback: handleErrorUpload,
        customPrefix: {
          public: ""
        },
        resumable: false
      };
      if (editImageAtom.editUploadPath) {
        await Storage.put(editImageAtom.editUploadPath, file, config);
        const uploadImageResponse = await API.getEditedImgUploadUrl({
          original_file_name: originalFileName,
          job_id: latestJobId,
          automation_id: automationId,
          mask_file_key: editImageAtom.editUploadPath,
          custom_bg_key: editImageAtom.customBgKey,
          output_with_bg_key: editImageAtom.outputWithBgKey,
          crop_id: editImageAtom.cropId
        });
        if (uploadImageResponse.data.success == true) {
          setIsShowSaveModal(false);
          router.push(router?.asPath);
          setIsOnLargePreview(true);
          updateLargePreview({
            id: imgId,
            name: imgName,
            url: imageURL
          });
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadProgress = (progressEvent: any) => {
    console.log("progressEvent:", progressEvent);
  };

  const handleCompleteUpload = (event: any) => {
    setIsShowSaveModal(false);
    console.log("completed:", event);
  };
  const handleErrorUpload = (error: any) => {
    console.log("Upload:  encountered error.`, error", error);
  };

  return (
    <>
      <SmartEditorCanvas
        customBgPath={customBgPath}
        isTransparent={isTransparent}
        bgColor={bgColor}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        drawRealTime={drawRealTime}
        saveMaskState={saveMaskState}
        maskUndo={maskUndo}
        maskRedo={maskRedo}
        isTrImgLoading={isTrImgLoading}
      />
      <div style={{ width: "100%", display: "block", visibility: "hidden" }}>
        <FabricJSCanvas className={styles.transparentBG} onReady={onReady} />
      </div>
      <Modal
        open={isShowSaveModal}
        onCancel={() => setIsShowSaveModal(false)}
        className={styles.confirmModal}
        footer={null}
        centered
      >
        <div style={{ height: "150px" }}>
          <Spin
            style={{ display: "flex", justifyContent: "center", paddingTop: "50px" }}
            spinning={true}
            indicator={<LoadingOutlined style={{ fontSize: 50, color: "#0038FF" }} spin />}
          />
        </div>
        <p style={{ display: "flex", justifyContent: "center", margin: "auto", fontSize: "20px", fontWeight: 700 }}>
          Saving changes
        </p>
        <p style={{ display: "flex", justifyContent: "center", margin: "auto", fontSize: "16px" }}>
          Your project will be updated shortly.
        </p>
      </Modal>
    </>
  );
};

export default MaskCanvas;

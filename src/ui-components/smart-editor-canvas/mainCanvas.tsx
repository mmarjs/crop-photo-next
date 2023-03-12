import styles from "./smart-editor-canvas.module.scss";
import { useEffect, useState, useMemo } from "react";
import { fabric } from "fabric";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

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
  useEditImage,
  useIsEdited
} from "../smart-crop-components/jotai";
import { IEvent } from "fabric/fabric-impl";
fabric.Object.NUM_FRACTION_DIGITS = 8;

interface SmartEditorCanvasProps {
  isTransparent?: boolean;
  bgColor?: string;
  customBgPath: string[];
  onMouseDown: any;
  onMouseUp: any;
  drawRealTime: any;
  saveMaskState: any;
  maskUndo: any;
  maskRedo: any;
  isTrImgLoading: boolean;
}

let stateStack: object[]; //undo stack
let redoStack: object[]; //redo stack
let maxCount: number = 100; //We keep 100 items in the stacks at any time.
let customBgImage: fabric.Image;
let mainImage: fabric.Image;
let originImage: fabric.Image;

const SmartEditorCanvas = ({
  isTransparent,
  bgColor,
  customBgPath,
  onMouseDown,
  onMouseUp,
  drawRealTime,
  saveMaskState,
  maskRedo,
  maskUndo,
  isTrImgLoading
}: SmartEditorCanvasProps) => {
  const { editor, onReady } = useFabricJSEditor();
  const [brushType, setBrushType] = useBrushType();
  const [cursorSize, setCursorSize] = useCursorSize();
  const [resetEdit] = useResetEdit();
  const [undoEdit] = useUndoEdit();
  const [redoEdit] = useRedoEdit();
  const [zoomInHandler] = useZoomInHandler();
  const [zoomOutHandler] = useZoomOutHandler();
  const [zoomValue, setZoomValue] = useZoomValue();
  const [stopRender, setStopRender] = useState(false);
  const [isImgLoading, setIsImgLoading] = useState(true);
  const [isBgLoading, setIsBgLoading] = useState(true);
  const [isOImgLoading, setOImgLoading] = useState(true);
  const [editImageAtom] = useEditImage();
  const [, setIsEdited] = useIsEdited();
  const [isFired, setIsFired] = useState(false)

  const imageURL: string | undefined = editImageAtom.transparentImgUrl;
  const customBgUrl: string | undefined = editImageAtom.customBgUrl;
  const originImgUrl: string | undefined = editImageAtom.originImgUrl;
  const center = editor?.canvas?.getCenter();

  let cursorValue: number = useMemo(() => cursorSize, [cursorSize]);

  useEffect(() => {
    redoStack = [];
    stateStack = [];
  }, []);
  //init backgroundColor and initialstate of undo/redo stack after all images are loaded.
  useEffect(() => {
    if (!editor || !fabric) {
      return;
    }
    if (!isBgLoading && !isImgLoading && !isOImgLoading && !isTrImgLoading) {
      fireMouseDownEvent()
      setBrushType(2);
      if (isTransparent && bgColor && (!customBgPath || customBgPath.length == 0)) {
        const bgImage = new Image((mainImage?.width as number) * (mainImage?.scaleX as number), editor.canvas.height)
        bgImage.crossOrigin = "anonymous"
        const bgFabricImage = new fabric.Image(bgImage)
        editor.canvas.setBackgroundImage(bgFabricImage, editor.canvas.renderAll.bind(editor.canvas), {backgroundColor: bgColor});
        bgFabricImage.viewportCenterH()
        // editor?.canvas.setBackgroundColor(bgColor, () => {});
      }else if (customBgUrl && customBgPath?.length > 0){
        editor.canvas.setBackgroundImage(customBgImage, editor.canvas.renderAll.bind(editor.canvas));
      }
      stateStack.push(editor.canvas.toJSON());
      editor.canvas.setViewportTransform(editor.canvas.viewportTransform as number[]);
    }
  }, [isBgLoading, isImgLoading, isOImgLoading, isTrImgLoading]);
  // add eventListener to canvas and document
  useEffect(() => {
    if (!editor || !fabric) {
      return;
    }

    //@ts-ignore
    if (!editor.canvas.__eventListeners["mouse:wheel"]) {
      editor.canvas.on("mouse:wheel", function (opt) {
        if (editor.canvas.getZoom() <= 1) {
          return;
        }
        //@ts-ignore
        var vpt = this.viewportTransform;
        if (opt.e.shiftKey) {
          //@ts-ignore
          vpt[4] += opt.e.deltaY / 2;
        } else {
          //@ts-ignore
          vpt[5] += opt.e.deltaY / 2;
        }
        //@ts-ignore
        this.requestRenderAll();
        opt.e.preventDefault();
        opt.e.stopPropagation();
      });
    }
    //@ts-ignore
    if (!editor.canvas.__eventListeners["mouse:down"]) {
      editor.canvas.on("mouse:down", function (opt) {
        //@ts-ignore
        if (opt.objCanvas) {
          makeErasedOriginImg(opt)
          editor.canvas.add(mainImage)
          mainImage.viewportCenterH()
        }
        if (editor.canvas.isDrawingMode) {
          onMouseDown(opt);
        }
      });
    }

    //@ts-ignore
    if (!editor.canvas.__eventListeners["mouse:move"]) {
      editor.canvas.on("mouse:move", function (opt) {
        if (editor.canvas.isDrawingMode) {
          onMouseMove(opt.e);
          const pointer = editor.canvas.getPointer(opt.e);
          drawRealTime(opt, pointer);
        }
      });
    }

    //@ts-ignore
    if (!editor.canvas.__eventListeners["mouse:up"]) {
      editor.canvas.on("mouse:up", function (opt) {
        if (editor.canvas.isDrawingMode === true) {
            onMouseUp(opt);
          saveState();
          saveMaskState();
        }
      });
    }

    //@ts-ignore
    if (!editor.canvas.__eventListeners["mouse:out"]) {
      editor.canvas.on("mouse:out", function (opt) {
        onMouseOut(opt);
      });
    }
    
    document.onkeydown = e => {
      if (e.key === "e") {
        setBrushType(1);
      }

      if (e.key === "r") {
        setBrushType(0);
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
        maskUndo();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
        maskRedo();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "=") {
        e.preventDefault();
        setZoom(0.1);
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault();
        setZoom(-0.1);
      }

      if (!(e.ctrlKey || e.metaKey) && e.key == "=") {
        e.preventDefault();
        cursorValue += 5;
        if (cursorValue > 100) cursorValue = 100;
        setCursorSize(cursorValue);
      }

      if (!(e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault();
        cursorValue -= 5;
        if (cursorValue < 0) cursorValue = 0;
        setCursorSize(cursorValue);
      }
    };
  }, [editor]);
  //set brushtype of canvas when user change the brush type.
  useEffect(() => {
    if (!editor || !fabric || isBgLoading || isImgLoading || isOImgLoading || isTrImgLoading) {
      return;
    }
    setStopRender(true);
    //@ts-ignore
    editor?.canvas?.get("backgroundImage")?.set({ erasable: false });
    switch (brushType) {
      case 1:
        //@ts-ignore
        editor.canvas.freeDrawingBrush = new fabric.EraserBrush(editor.canvas);
        if (isTransparent && bgColor && (!customBgPath || customBgPath.length == 0)) {
          //@ts-ignore
          editor.canvas.freeDrawingBrush = new fabric.EraserBrush(editor.canvas);
        }
        //@ts-ignore
        editor?.canvas.freeDrawingBrush.width = parseInt(cursorSize / zoomValue, 10);
        editor.canvas.isDrawingMode = true;
        break;
      case 0:
        //@ts-ignore
        editor.canvas.freeDrawingBrush = new fabric.EraserBrush(editor.canvas);
        //@ts-ignore
        editor.canvas.freeDrawingBrush.inverted = true;
        //@ts-ignore
        editor?.canvas.freeDrawingBrush.width = parseInt(cursorSize / zoomValue, 10);
        editor.canvas.isDrawingMode = true;
        break;
      default:
        break;
    }
  }, [brushType, cursorSize, isFired]);

  useEffect(() => {
    if (!editor || !fabric) {
      return;
    }
    addImages();
  }, [editor?.canvas.backgroundImage]);
  // set brushSize dynamically.
  useEffect(() => {
    // @ts-ignore
    editor?.canvas.freeDrawingBrush.width = parseInt(cursorSize / zoomValue, 10);
  }, [zoomInHandler, zoomOutHandler, cursorSize, brushType, zoomValue]);

  // call undo function when undo button is clicked
  useEffect(() => {
    if (!editor || !fabric) {
      return;
    }
    undo();
  }, [undoEdit]);

  // call redo function when redo button is clicked.
  useEffect(() => {
    if (!editor || !fabric) {
      return;
    }
    redo();
  }, [redoEdit]);

  // call restore function when restore button is clicked.
  useEffect(() => {
    if (!editor || !fabric) {
      return;
    }
    restore();
  }, [resetEdit]);

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
    if (zoomValue === 1) {
      //@ts-ignore
      editor?.canvas.viewportTransform[4] = 0;
      //@ts-ignore
      editor?.canvas.viewportTransform[5] = 0;
    }
  }, [zoomValue]);

  // add images to the canvas from urls
  const addImages = () => {
    if (!editor || !fabric || stopRender) {
      return;
    }
    if (!customBgUrl) {
      setIsBgLoading(false);
    }
    if (!originImgUrl) {
      setOImgLoading(false);
    }
    setStopRender(true);
    if (imageURL) {
      const image = new Image();
      image.src = imageURL;
      image.crossOrigin = "anonymous";

      image.onload = () => {
        mainImage = new fabric.Image(image);
        mainImage.set({
          selectable: false,
          evented: false
        });
        mainImage.scaleToHeight(window.innerHeight - 75);
        editor.canvas?.setWidth((mainImage?.width as number) * (mainImage?.scaleX as number));
        // editor.canvas.setWidth(window.innerWidth - 340)
        editor.canvas?.setHeight(window.innerHeight - 75);
        mainImage.viewportCenterH();
        setIsImgLoading(false);
      };
    }
    if (customBgUrl) {
      const customBg = new Image();
      customBg.src = customBgUrl;
      customBg.crossOrigin = "anonymous";

      customBg.onload = () => {
        customBgImage = new fabric.Image(customBg);
        customBgImage.set({
          selectable: false,
          evented: false
        });
        customBgImage.scaleToHeight(window.innerHeight - 75);
        editor.canvas?.setWidth((customBgImage?.width as number) * (customBgImage?.scaleX as number));
        // editor.canvas.setWidth(window.innerWidth - 340)
        editor.canvas?.setHeight(window.innerHeight - 75);
        customBgImage.viewportCenterH();
        setIsBgLoading(false);
      };
    }
    if (originImgUrl) {
      const image = new Image();
      image.src = originImgUrl;
      image.crossOrigin = "anonymous";

      image.onload = () => {
        originImage = new fabric.Image(image);
        originImage.set({
          selectable: false,
          evented: false
        });
        editor.canvas.add(originImage)
        originImage.scaleToHeight(window.innerHeight - 75);
        editor.canvas?.setWidth((originImage?.width as number) * (originImage?.scaleX as number));
        // editor.canvas.setWidth(window.innerWidth - 340)
        editor.canvas?.setHeight(window.innerHeight - 75);
        originImage.viewportCenterH();
        setOImgLoading(false);
      };
    }
  };

  // save canvas state every time mouse up.
  const saveState = () => {
    setIsEdited(true);
    if (stateStack.length === maxCount) {
      stateStack.shift();
    }

    if (editor?.canvas.toJSON()) {
      editor.canvas.setViewportTransform(editor.canvas.viewportTransform as number[]);
      stateStack.push(editor?.canvas.toJSON());
    }
  };

  // apply the state to canvas when undo, redo, restore
  const applyState = async (state: object) => {
    if (!editor || !fabric) {
      return;
    }
    if (isBgLoading || isImgLoading || isOImgLoading || isTrImgLoading) {
      return;
    }
    if (editor.canvas.getContext()) {
      editor?.canvas.clear();
      let canvas = new fabric.Canvas(null);
      canvas?.setWidth((mainImage?.width as number) * (mainImage?.scaleX as number));
      // editor.canvas.setWidth(window.innerWidth - 340)
      canvas?.setHeight(window.innerHeight - 75);
      canvas.loadFromJSON(state, () => {
        let dataUrl = canvas.toDataURL({ quality: 1 });
        fabric.Image.fromURL(
          dataUrl,
          (image: fabric.Image) => {
            image.set({
              selectable: false,
              evented: false
            });
            if (originImage) {
              editor.canvas.add(originImage)
              originImage.viewportCenterH()
              fireMouseDownEvent()
              setIsFired(!isFired)
            }
            editor?.canvas.add(image);
            image.viewportCenterH()
            originImage.bringToFront()
          },
          { crossOrigin: "anonymous" }
        );
      })

      if (isTransparent && bgColor && (!customBgPath || customBgPath.length == 0)) {
        const bgImage = new Image((mainImage?.width as number) * (mainImage?.scaleX as number), editor.canvas.height)
        bgImage.crossOrigin = "anonymous"
        const bgFabricImage = new fabric.Image(bgImage)
        editor.canvas.setBackgroundImage(bgFabricImage, editor.canvas.renderAll.bind(editor.canvas), {backgroundColor: bgColor});
        bgFabricImage.viewportCenterH()
        // editor?.canvas.setBackgroundColor(bgColor, () => {});
      }else if (customBgUrl && customBgPath?.length > 0){
        editor.canvas.setBackgroundImage(customBgImage, editor.canvas.renderAll.bind(editor.canvas));
      }
    }
  };

  // undo state function
  const undo = () => {
    if (isBgLoading || isImgLoading || isOImgLoading || isTrImgLoading) {
      return;
    }
    if (stateStack.length > 1) {
      let currentState: object | undefined = stateStack.pop();
      redoStack.push(currentState as object);
      applyState(stateStack[stateStack.length - 1]);
    }
  };

  //redo state function
  const redo = () => {
    if (isBgLoading || isImgLoading || isOImgLoading || isTrImgLoading) {
      return;
    }
    if (redoStack.length > 0) {
      applyState(redoStack[redoStack.length - 1]);
      let currentState: object | undefined = redoStack.pop();
      stateStack.push(currentState as object);
    }
  };

  //restore initial state function
  const restore = () => {
    if (isBgLoading || isImgLoading || isOImgLoading || isTrImgLoading) {
      return;
    }
    if (stateStack.length > 1 || redoStack.length > 0) {
      setIsEdited(false);
      let initialState = stateStack[0];
      applyState(initialState);
      stateStack = [];
      redoStack = [];
      stateStack.push(initialState);
      setBrushType(brushType);
    }
  };

  //show circle cursor when mouse move on canvas
  const onMouseMove = (e: any) => {
    let circleCursor = document.getElementById("circle");
    if (circleCursor) {
      circleCursor.style.visibility = "visible";
      circleCursor.style.left = e.pageX + "px";
      circleCursor.style.top = e.pageY + "px";
    }
  };

  // hide circle cursor when mouse out.
  const onMouseOut = (e: any) => {
    let circleCursor = document.getElementById("circle");
    //@ts-ignore
    circleCursor.style.visibility = "hidden";
  };

   // zoom function
  const setZoom = (zoom: any, point: any = { x: center?.left, y: center?.top }) => {
    if (isBgLoading || isImgLoading || isOImgLoading || isTrImgLoading) {
      return;
    }
    if (editor?.canvas.getContext()) {
      var newZoom = editor?.canvas?.getZoom() + zoom;
      if (newZoom > 10) newZoom = 10;
      if (newZoom < 0.1) newZoom = 0.1;
      setZoomValue(newZoom);
      editor?.canvas?.zoomToPoint(point, newZoom);
      //@ts-ignore
      editor?.canvas.clipPath = new fabric.Rect({
        width: editor?.canvas.width,
        height: editor?.canvas.height,
        fill: "transparent",
        hasControls: false
      });

      if (newZoom === 1) {
        //@ts-ignore
        editor?.canvas.viewportTransform[4] = 0;
        //@ts-ignore
        editor?.canvas.viewportTransform[5] = 0;
      }
    }
  };

  //make the originalImage to erased image for original image restore.
  const makeErasedOriginImg = (opt: IEvent<MouseEvent>) => {
    //@ts-ignore
    editor.canvas.freeDrawingBrush = new fabric.EraserBrush(editor.canvas);
    //@ts-ignore
    editor?.canvas.isDrawingMode = true;
    //@ts-ignore
    editor?.canvas?.get("backgroundImage")?.set({ erasable: false });
    let width: number = editor?.canvas.width as number;
    let height: number = editor?.canvas.height as number;
    //@ts-ignore
    editor?.canvas.freeDrawingBrush.width = Math.max(height, editor?.canvas.width) * 2;
    let centerPoint = { x: width / 2, y: height / 2 }
    //@ts-ignore
    editor?.canvas.freeDrawingBrush.onMouseDown(centerPoint, opt)
    //@ts-ignore
    editor?.canvas.freeDrawingBrush.onMouseUp(opt)
    //@ts-ignore
    editor?.canvas.isDrawingMode = false;
  }

  // fire mouse down event for erased original image.
  const fireMouseDownEvent = () => {
    if (!editor || !fabric) {
      return;
    }
    editor.canvas.fire("mouse:down",{
        objCanvas: mainImage,
        absolutePointer: new fabric.Point(1, 1),
        button: 1,
        e: new MouseEvent("mousedown", { clientX: 1, clientY: 1, bubbles: true, buttons: 1, composed: true, detail: 1, screenX: 1, screenY: 1, view: window }),
        pointer: { x: 1, y: 1 },
        subTargets: [],
        target: null,
        transform: null,
      }
    )
  }

  return (
    <>
      {
        <span
          className={styles.customCursor}
          style={{
            pointerEvents: "none",
            cursor: "pointer",
            width: cursorSize + "px",
            height: cursorSize + "px",
            visibility: "hidden"
          }}
          id="circle"
        ></span>
      }
      <Spin
        spinning={isBgLoading || isImgLoading || isOImgLoading || isTrImgLoading}
        className={styles.Spinner}
        indicator={<LoadingOutlined style={{ fontSize: 50, color: "#0038FF" }} spin />}
      >
      <FabricJSCanvas onReady={onReady} />
      </Spin>
    </>
  );
};

export default SmartEditorCanvas;

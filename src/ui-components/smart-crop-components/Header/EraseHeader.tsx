import { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./Header.module.scss";
import { Tooltip } from "../../components/tooltip";
import {
  useRedoEdit,
  useUndoEdit,
  useZoomInHandler,
  useZoomOutHandler,
  useZoomValue,
  useIsOpenEditPanel,
  useIsOnLargePreview,
  useEditImage,
  useLargePreviewData
} from "../jotai";
import { useRouter } from "next/router";
import {
  EditedImageIcon,
  IconBrush,
  IconTrashBar,
  IconMore,
  CloseIcon,
  IconUndo,
  IconRedo,
  IconZoomOutActive,
  IconZoomOutDisable,
  IconZoomInActive,
  IconZoomInDisable,
  IconDownArrow
} from "../../../ui-components/assets";
import { toInteger } from "lodash";
import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import DropdownItem from "./DropdownItem";

const EraseHeader = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [undoEdit, setUndoEdit] = useUndoEdit();
  const [redoEdit, setRedoEdit] = useRedoEdit();
  const [zoomInHandler, setZoomInHandler] = useZoomInHandler();
  const [zoomOutHandler, setZoomOutHandler] = useZoomOutHandler();
  const [zoomValue, setZoomValue] = useZoomValue();
  const [editImageAtom] = useEditImage();
  const [, setIsOpenEditPanel] = useIsOpenEditPanel();
  const [largePreview, updateLargePreview] = useLargePreviewData();
  const [isOnLargePreview, setIsOnLargePreview] = useIsOnLargePreview();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [inputZoomValue, setInputZoomValue] = useState(`${Math.round(zoomValue * 100)}%`);
  const platform = window.navigator.platform;
  const items: MenuProps["items"] = [
    {
      key: "input",
      label: (
        <div>
          <input
            type="text"
            style={{ border: "none", margin: "0px" }}
            onKeyUp={e => handleEnterZoomValue(e.key)}
            onChange={e => setInputZoomValue(e.target.value)}
            value={inputZoomValue}
          />
          <hr style={{ border: "1px solid #E9ECEE" }} />
        </div>
      )
    },
    {
      key: "zoomIn",
      label: <DropdownItem title="Zoom In" shortcut={`${platform === "MacIntel" ? "Cmd" : "Ctrl"} +`}></DropdownItem>
    },
    {
      key: "zoomOut",
      label: <DropdownItem title="Zoom Out" shortcut={`${platform === "MacIntel" ? "Cmd" : "Ctrl"} -`}></DropdownItem>
    },
    {
      key: "fitScreen",
      label: <DropdownItem title="Fit to screen" shortcut="Shift + 1"></DropdownItem>
    },
    {
      key: "zoom50",
      label: <DropdownItem title="Zoom to 50%"></DropdownItem>
    },
    {
      key: "zoom100",
      label: (
        <DropdownItem title="Zoom to 100%" shortcut={`${platform === "MacIntel" ? "Cmd" : "Ctrl"} + 0`}></DropdownItem>
      )
    },
    {
      key: "zoom200",
      label: <DropdownItem title="Zoom to 200%"></DropdownItem>
    }
  ];

  const handleEnterZoomValue = (key: string) => {
    if (key === "Enter") {
      setZoomValue(toInteger(inputZoomValue) / 100);
      setInputZoomValue(`${inputZoomValue}%`);
    }
  };

  const handleDropItemClick: MenuProps["onClick"] = e => {
    if (e.key === "input") {
      setIsDropdownOpen(true);
    }
    if (e.key === "zoomIn") {
      setIsDropdownOpen(true);
      handleZoomIn();
    }

    if (e.key === "zoomOut") {
      setIsDropdownOpen(true);
      handleZoomOut();
    }
    if (e.key === "fitScreen") {
      setIsDropdownOpen(true);
      setZoomValue(1);
    }
    if (e.key === "zoom50") {
      setIsDropdownOpen(true);
      setZoomValue(0.5);
    }
    if (e.key === "zoom100") {
      setIsDropdownOpen(true);
      setZoomValue(1);
    }
    if (e.key === "zoom200") {
      setIsDropdownOpen(true);
      setZoomValue(2);
    }
  };

  const handleOpenChange = (flag: boolean) => {
    setIsDropdownOpen(flag);
  };

  const handleUndoEdit = () => {
    setUndoEdit(!undoEdit);
  };

  const handleRedoEdit = () => {
    setRedoEdit(!redoEdit);
  };

  const handleZoomIn = () => {
    setZoomInHandler(!zoomInHandler);
  };

  const handleZoomOut = () => {
    setZoomOutHandler(!zoomOutHandler);
  };

  // function handleClose() {
  //   router.push(
  //     `${pathname}?automationId=${automationId}&editing=${Boolean(editing)}&step=${toInteger(step)}&status=${status}`
  //   );
  //   setIsOpenEditPanel(false);
  //   setIsOnLargePreview(false);
  //   updateEditImage({} as Photo);
  //   setZoomValue(1);
  // }

  const handleClose = () => {
    if (largePreview) {
      setIsOnLargePreview(false);
      updateLargePreview(undefined);
    } else {
      router.push("/");
    }
  };

  const handleEdit = () => {
    if (largePreview) {
      // const image = croppedImages.find(image => image.id === largePreview.id);
      // if (image) {
      router.push(router?.asPath);
      setIsOpenEditPanel(true);
      // updateEditImage(image);
      setIsOnLargePreview(false);
      updateLargePreview(undefined);
      // }
    }
  };

  return (
    <>
      <div className={styles.header}>
        {isOnLargePreview ? (
          <div style={{ display: "inline-flex", alignItems: "center", fontSize: "14px", fontWeight: 500 }}>
            <button onClick={handleClose} className={styles.iconBtn} style={{ display: "flex" }}>
              <CloseIcon />
            </button>
            &nbsp;&nbsp;
            <span>{largePreview?.name}</span>
            &nbsp;&nbsp;
            <EditedImageIcon />
          </div>
        ) : null}
        {isOnLargePreview ? (
          <div>
            <Tooltip
              title={
                <div className={styles.toolTip}>
                  <span>Edit Background</span>
                </div>
              }
              placement="bottom"
            >
              <button className={styles.iconBtn} onClick={handleEdit}>
                <IconBrush />
              </button>
            </Tooltip>
            <Tooltip
              title={
                <div className={styles.toolTip}>
                  <span>Delete Image</span>
                </div>
              }
              placement="bottom"
            >
              <button className={styles.iconBtn} onClick={() => {}}>
                <IconTrashBar />
              </button>
            </Tooltip>
            <Tooltip
              title={
                <div className={styles.toolTip}>
                  <span>More Options</span>
                </div>
              }
              placement="bottom"
            >
              <button className={styles.iconBtn} onClick={() => {}}>
                <IconMore width="36" height="36" />
              </button>
            </Tooltip>
          </div>
        ) : (
          <div>
            <Tooltip
              title={
                <div className={styles.toolTip} style={{ width: "101px" }}>
                  <span>Undo</span>
                  <span style={{ color: "#9BA1A8" }}>{`${platform === "MacIntel" ? "Cmd" : "Ctrl"} + Z`}</span>
                </div>
              }
              placement="bottom"
            >
              <button className={styles.iconBtn} onClick={handleUndoEdit}>
                <IconUndo />
              </button>
            </Tooltip>
            <Tooltip
              title={
                <div className={styles.toolTip} style={{ width: "101px" }}>
                  <span>Redo</span>
                  <span style={{ color: "#9BA1A8" }}>{`${platform === "MacIntel" ? "Cmd" : "Ctrl"} + Y`}</span>
                </div>
              }
              placement="bottom"
            >
              <button className={styles.iconBtn} onClick={handleRedoEdit}>
                <IconRedo />
              </button>
            </Tooltip>
          </div>
        )}
        <div style={{ display: "inline-flex", alignItems: "center" }}>
          <Tooltip
            title={
              <div className={styles.toolTip} style={{ width: "101px" }}>
                <span>Zoom Out</span>
                <span style={{ color: "#9BA1A8" }}>{`${platform === "MacIntel" ? "Cmd" : "Ctrl"}-`}</span>
              </div>
            }
            placement="bottom"
          >
            <button className={styles.iconBtn} style={{ padding: "10px" }} onClick={handleZoomOut}>
              {zoomValue == 0.1 ? <IconZoomOutDisable /> : <IconZoomOutActive />}
            </button>
          </Tooltip>
          <Tooltip
            title={
              <div className={styles.toolTip} style={{ width: "101px" }}>
                <span>Zoom In</span>
                <span style={{ color: "#9BA1A8" }}>{`${platform === "MacIntel" ? "Cmd" : "Ctrl"}+`}</span>
              </div>
            }
            placement="bottom"
          >
            <button className={styles.iconBtn} style={{ padding: "10px" }} onClick={handleZoomIn}>
              {zoomValue == 10 ? <IconZoomInDisable /> : <IconZoomInActive />}
            </button>
          </Tooltip>
          <Dropdown
            menu={{ items, onClick: handleDropItemClick }}
            open={isDropdownOpen}
            onOpenChange={handleOpenChange}
            placement="bottomLeft"
            trigger={["click"]}
          >
            <div className={styles.iconBtn} style={{ padding: "10px" }}>
              <label>{`${Math.round(zoomValue * 100)}`}% &nbsp;</label>
              <span>
                <IconDownArrow style={{ position: "relative", bottom: "3px" }} />
              </span>
            </div>
          </Dropdown>
        </div>
      </div>
    </>
  );
};

export default EraseHeader;

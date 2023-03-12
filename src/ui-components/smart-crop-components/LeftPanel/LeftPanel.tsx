import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { useRouter } from "next/router";
import { redirectToApplication } from "../../../lib/navigation/routes";
import { Button } from "../../components/button";
import { Tooltip } from "../../components/tooltip";
import { Divider, Modal } from "antd";
import EditableAutomationName from "../../components/Editable-automation-name";
import Stepper from "../../components/Stepper";

import styles from "./LeftPanel.module.scss";
import { AUTOMATION_STATUS } from "../../../common/Enums";

import {
  useEditImage,
  useBrushType,
  useCursorSize,
  useResetEdit,
  useIsEditSave,
  useIsOpenEditPanel,
  useZoomValue,
  useIsEdited
} from "../jotai";
import classNames from "classnames";
import { toInteger } from "lodash";
import { Photo, SmartCropEditUrls } from "../../../common/Types";
import {
  AccordionDownIcon,
  AccordionUpIcon,
  CloseModalIcon,
  EraseIcon,
  KeyboardIcon,
  ResetIcon,
  RestoreIcon,
  IconBeta
} from "../../assets";
import { IconLeftAngle, IconCursorTarget, IconQuestion } from "../../assets";
import { toast } from "../../components/toast";

type LeftPanelProps = {
  type?: string;
  currentStep: number;
  displayStepComponent: JSX.Element | undefined;
  onStartCrop: () => void;
  loading: boolean;
  stepNames: string[];

  editableNamePlaceholder: string;
  automationName: string;
  onAutomationNameChange: (name: string) => void;
  onNext: (close?: boolean) => void;
  page: "UnrecognizableCrop" | "BgResizeCrop" | "CustomSmartCrop";
};

const kbShortcuts = [
  {
    label: "keyboard_shortcuts.erase",
    shortcut: {
      MacIntel: ["E"],
      Win: ["E"],
      Win32: ["E"]
    }
  },
  {
    label: "keyboard_shortcuts.restore",
    shortcut: {
      MacIntel: ["R"],
      Win: ["R"],
      Win32: ["R"]
    }
  },
  {
    label: "keyboard_shortcuts.increase_thickness",
    shortcut: {
      MacIntel: ["+"],
      Win: ["+"],
      Win32: ["+"]
    }
  },
  {
    label: "keyboard_shortcuts.decrease_thickness",
    shortcut: {
      MacIntel: ["-"],
      Win: ["-"],
      Win32: ["-"]
    }
  },
  {
    label: "keyboard_shortcuts.undo",
    shortcut: {
      MacIntel: ["Cmd", "Z"],
      Win: ["Ctrl", "Z"],
      Win32: ["Ctrl", "Z"]
    }
  },
  {
    label: "keyboard_shortcuts.redo",
    shortcut: {
      MacIntel: ["Cmd", "Y"],
      Win: ["Ctrl", "Y"],
      Win32: ["Ctrl", "Y"]
    }
  },
  {
    label: "keyboard_shortcuts.scroll_y",
    shortcut: {
      MacIntel: ["+", "Scroll"],
      Win: ["+", "Scroll"],
      Win32: ["+", "Scroll"]
    }
  },
  {
    label: "keyboard_shortcuts.scroll_x",
    shortcut: {
      MacIntel: ["Shift", "Scroll"],
      Win: ["Shift", "Scroll"],
      Win32: ["Shift", "Scroll"]
    }
  }
];

const LeftPanel = ({
  stepNames,
  currentStep,
  displayStepComponent,
  loading,
  onStartCrop,
  automationName,
  onAutomationNameChange,
  editableNamePlaceholder,
  onNext
}: LeftPanelProps) => {
  const router = useRouter();
  const { status, automationId, editing, step } = router?.query;
  const { t } = useTranslation();
  const [editImageAtom, updateEditImage] = useEditImage();
  const [brushType, setBrushType] = useBrushType();
  const [cursorSize, setCursorSize] = useCursorSize();
  const [resetEdit, setResetEdit] = useResetEdit();
  const [isEditSave, setIsEditSave] = useIsEditSave();
  const [isPanelShow, setIsPanelShow] = useState(false);
  const [isShowAccordion, setIsShowAccordion] = useState(true);
  const rangeInputEl = useRef(null);
  const curSizePanelEl = useRef(null);
  const [isShowCancelModal, setIsShowCancelModal] = useState(false);
  const [isOpenEditPanel, setIsOpenEditPanel] = useIsOpenEditPanel();
  const [zoomValue, setZoomValue] = useZoomValue();
  const [isEdited, setIsEdited] = useIsEdited();
  const pathname = router?.pathname;

  useEffect(() => {
    if (!isOpenEditPanel) {
      return;
    }
    //@ts-ignore
    rangeInputEl.current.style.setProperty("--value", cursorSize);
    //@ts-ignore
    rangeInputEl.current.style.setProperty("--min", "0");
    //@ts-ignore
    rangeInputEl.current.style.setProperty("--max", "100");
  }, [isOpenEditPanel, cursorSize]);

  useEffect(() => {}, [cursorSize]);

  function handleClose() {
    if (status === AUTOMATION_STATUS.COMPLETED || status === AUTOMATION_STATUS.RUNNING) {
      //if automation already completed or running
      //no need to save and close
      redirectToApplication(router);
    } else {
      //save the updates and close
      if (automationName?.length < 3) {
        toast("error", t("configuration.errors.automation_name_len"));
        return;
      }
      onNext(true);
    }
  }

  function handlePreviousStep() {
    setIsShowCancelModal(false);
    setIsEdited(false);
    router.push(
      `${pathname}?automationId=${automationId}&editing=${Boolean(editing)}&step=${toInteger(step)}&status=${status}`
    );
    setIsOpenEditPanel(false);
    updateEditImage({} as SmartCropEditUrls);
    setZoomValue(1);
  }

  const handleBackButton = () => {
    if (isEdited) {
      setIsShowCancelModal(true);
    } else {
      handlePreviousStep();
    }
  };

  const handleEraser = () => {
    setBrushType(1);
  };

  const handleReset = () => {
    setResetEdit(!resetEdit);
  };

  const handleUndo = () => {
    setBrushType(0);
  };

  const handleCursorSizeChange = (e: any) => {
    setCursorSize(e.target.value);
    //@ts-ignore
    rangeInputEl.current.style.setProperty("--value", e.target.value);
    //@ts-ignore
    rangeInputEl.current.style.setProperty("--min", e.target.min == "" ? "0" : e.target.min);
    //@ts-ignore
    rangeInputEl.current.style.setProperty("--max", e.target.max == "" ? "100" : e.target.max);
    //@ts-ignore
    rangeInputEl.current.addEventListener("input", () =>
      //@ts-ignore
      rangeInputEl.current.style.setProperty("--value", e.target.value)
    );
  };

  const handleSliderMouseMove = (e: any) => {
    if (isPanelShow) {
      //@ts-ignore
      curSizePanelEl.current.style.top = e.pageY + 15 + "px";
      //@ts-ignore
      curSizePanelEl.current.style.left = e.pageX + "px";
    }
  };

  const handleSliderMouseDown = (e: any) => {
    setIsPanelShow(true);
    //@ts-ignore
    curSizePanelEl.current.style.visibility = "visible";
  };

  const handleSliderMouseUp = (e: any) => {
    setIsPanelShow(false);
    //@ts-ignore
    curSizePanelEl.current.style.visibility = "hidden";
  };

  const handleShowAccrodion = () => {
    setIsShowAccordion(!isShowAccordion);
  };

  const handleOnSave = () => {
    setIsEditSave(!isEditSave);
  };

  return (
    <>
      <div className={styles.leftWrapper}>
        <div className={styles.leftHeader}>
          <div>
            {isOpenEditPanel ? (
              <div style={{ display: "inline-flex", alignItems: "center" }}>
                <Button onClick={handleBackButton} className={styles.iconBtn} icon={<IconLeftAngle />} />
                <span className={styles.ellipsis}>{editImageAtom.imgName}</span>
              </div>
            ) : (
              <span>Settings</span>
            )}
          </div>
          {!isOpenEditPanel && (
            <Button
              onClick={handleClose}
              type="text"
              icon={<Image src="/images/cross.svg" width={10} height={10} alt="" />}
            />
          )}
        </div>
        {!isOpenEditPanel && (
          <>
            <div
              style={{
                flexGrow: 1,
                overflowY: "auto",
                padding: "1.5rem",
                height: "1rem",
                position: "relative",
                marginTop: "auto"
              }}
            >
              <EditableAutomationName
                placeholder={editableNamePlaceholder}
                automationName={automationName}
                onAutomationNameChange={onAutomationNameChange}
              />
              {!!displayStepComponent ? displayStepComponent : null}
            </div>
            <Stepper
              automationName={automationName}
              stepNames={stepNames}
              currentStep={currentStep}
              onSubmitJobConfig={onStartCrop}
              loading={loading}
              showStepperButtons={currentStep <= stepNames?.length - 1}
              onNextStep={onNext}
            />
          </>
        )}
        {/* TODO: @milenko Remove all the inline styles and put in the scss file. */}
        {isOpenEditPanel && (
          <div style={{ overflow: "auto" }}>
            <div style={{ margin: "24px" }}>
              <div className={styles.heading}>
                {t("erase_restore_detail.title")}&nbsp;&nbsp;&nbsp;
                <IconBeta />
                &nbsp;&nbsp;&nbsp;
                <IconQuestion />
              </div>
              <div className={styles.subHeading}>{t("erase_restore_detail.description")}</div>
            </div>
            <div style={{ margin: "24px" }}>
              <div className={styles.heading}>{t("erase_restore.tool_thickness")}</div>
              <div style={{ display: "flex", alignContent: "center", justifyContent: "space-between" }}>
                <input
                  ref={rangeInputEl}
                  type="range"
                  value={cursorSize}
                  min={1}
                  max={100}
                  className={classNames(styles.rangeInput, styles.sliderProgress)}
                  style={{ width: "70%" }}
                  onChange={handleCursorSizeChange}
                  onMouseMove={handleSliderMouseMove}
                  onMouseDown={handleSliderMouseDown}
                  onMouseUp={handleSliderMouseUp}
                />
                <p style={{ width: "20%", marginTop: "30px" }}>{cursorSize}%</p>
              </div>
            </div>
            <div style={{ margin: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                <Tooltip
                  title={
                    <div className={styles.toolTip} style={{ width: "81px" }}>
                      <span>{t("erase_restore.erase")}</span>
                      <span style={{ color: "#9BA1A8" }}>E</span>
                    </div>
                  }
                  placement="bottom"
                >
                  <Button
                    className={styles.radiusBtn}
                    style={{
                      marginRight: "16px",
                      backgroundColor: brushType == 1 ? "#061425" : "",
                      color: brushType == 1 ? "#ffffff" : ""
                    }}
                    onClick={handleEraser}
                    icon={<EraseIcon fill={brushType == 1 ? "#ffffff" : ""} />}
                    label={t("erase_restore.erase")}
                  />
                </Tooltip>
                <Tooltip
                  title={
                    <div className={styles.toolTip} style={{ width: "81px" }}>
                      <span>{t("erase_restore.restore")}</span>
                      <span style={{ color: "#9BA1A8" }}>R</span>
                    </div>
                  }
                  placement="bottom"
                >
                  <Button
                    className={styles.radiusBtn}
                    style={{
                      backgroundColor: brushType == 0 ? "#061425" : "",
                      color: brushType == 0 ? "#ffffff" : ""
                    }}
                    onClick={handleUndo}
                    icon={<RestoreIcon fill={brushType == 0 ? "#ffffff" : "#061425"} />}
                    label={t("erase_restore.restore")}
                  />
                </Tooltip>
              </div>
              {/* <div style={{ display: "flex", justifyContent: "center" }}> */}
              <Button
                onClick={handleReset}
                label={t("erase_restore.reset")}
                icon={<ResetIcon />}
                className={styles.radiusBtn}
                style={{ width: "100%" }}
              />
              {/* </div> */}
              <Divider />
            </div>

            <div style={{ margin: "24px" }}>
              <div
                style={{ marginBottom: "0px", display: "flex", justifyContent: "space-between", cursor: "pointer" }}
                onClick={handleShowAccrodion}
              >
                <span style={{ fontSize: "16px", fontWeight: "600" }}>
                  <KeyboardIcon />
                  &nbsp;&nbsp; {t("erase_restore.kb_shortcuts")}
                </span>
                <button className={styles.iconBtn} style={{ padding: "10px" }}>
                  {isShowAccordion ? <AccordionUpIcon /> : <AccordionDownIcon />}
                </button>
              </div>
              <div style={{ display: isShowAccordion ? "block" : "none", paddingBottom: isShowAccordion ? "75px" : 0 }}>
                <div style={{ color: "#626970", fontSize: "14px", fontWeight: "400", marginBottom: "10px" }}>
                  <span>{t("erase_restore.kb_shortcuts_desc")}</span>
                </div>
                {kbShortcuts.map((sh, index) => {
                  const platform = window.navigator.platform;
                  const keys = (sh.shortcut as any)[platform];
                  return (
                    <div key={index} className={styles.kbShortcutRow}>
                      <div className={styles.shortcutLabel}>
                        <span>{t(sh.label)}</span>
                      </div>
                      <div className={styles.shortcuts}>
                        {keys?.map((key: string, i: number) => (
                          <div key={i} className={styles.shortcutKey}>
                            <span>{key}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ position: "fixed", bottom: "0px" }}>
              <div
                style={{
                  margin: "24px",
                  display: "flex",
                  justifyContent: "space-between",
                  background: "#fff",
                  paddingTop: 24
                }}
              >
                <Button
                  className={styles.btn}
                  type="default"
                  label={t("erase_restore.cancel")}
                  disabled={loading}
                  onClick={() => setIsShowCancelModal(true)}
                  loading={loading}
                  style={{ marginRight: "16px" }}
                />

                <Button
                  className={styles.btn}
                  type="primary"
                  label="Save"
                  disabled={loading || !isEdited}
                  onClick={handleOnSave}
                  loading={loading}
                />
              </div>
            </div>
            <div
              ref={curSizePanelEl}
              className={styles.cursizePanel}
              style={{
                width: `${cursorSize - -30}px`,
                height: `${cursorSize - -30}px`,
                position: "absolute",
                visibility: "hidden"
              }}
            >
              <div className={styles.circle}>
                <div style={{ width: "100%", height: "100%", display: "flex" }}>
                  <IconCursorTarget style={{ margin: "auto" }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Modal
        title={t("erase_restore.unsafe_leave")}
        open={isShowCancelModal}
        onCancel={() => setIsShowCancelModal(false)}
        className={styles.confirmModal}
        closeIcon={<CloseModalIcon />}
        footer={null}
        centered
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
          <p style={{ margin: "auto", fontSize: "16px" }}>{t("erase_restore.lose_changes")}</p>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "16px" }}>
          <Button
            style={{ width: "50%", fontWeight: 600 }}
            type="default"
            label={t("erase_restore.editing")}
            onClick={() => setIsShowCancelModal(false)}
          />
          <Button
            style={{ width: "50%", fontWeight: 600 }}
            type="primary"
            danger
            label={t("erase_restore.discard")}
            onClick={handlePreviousStep}
          />
        </div>
      </Modal>
    </>
  );
};

export default LeftPanel;

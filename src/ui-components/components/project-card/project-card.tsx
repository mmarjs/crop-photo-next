import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import classnames from "classnames";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { CustomModal } from "../modal";
import { Tooltip } from "../tooltip";
import { LegacyButtonType } from "antd/lib/button/button";
import { DeleteModalContent, DuplicateModalContent, RenameModalContent } from "./modal-content";
import API from "../../../util/web/api";
import { AUTOMATION_STATUS } from "../../../common/Enums";
import AutomationItem from "../../../models/AutomationItem";
import { useRouter } from "next/router";
import isUndefined from "lodash/isUndefined";

import styles from "./project-card.module.scss";
import { toast } from "../toast";
import { useAutomationType, useUpdateAutomationId } from "../../smart-crop-components/jotai/atomQueries";
import { useTranslation } from "react-i18next";
import { SMART_CROP_TYPE } from "../../smart-crop-components/jotai/atomTypes";
import { AutomationType } from "../../enums/AutomationType";
import { DefaultAutomationName } from "../../enums/DefaultAutomationName";
import { useAutomationStatus } from "../../smart-crop-components/jotai";
import { useGetandSetFaceCropName } from "../../smart-crop-components/jotai/customFaceCrop/atomStore";
import { useGetandSetUnrecogCropName } from "../../smart-crop-components/jotai/unrecognizableCrop/atomStore";
import {useRemoveBgResizeAutomationName} from "../../smart-crop-components/jotai/removeBgResize/atomStore";
import {Logger} from "aws-amplify";

export interface ProjectCardProps {
  /**
   * ID of the project
   */
  id: string;
  /**
   /**
   * Title of the project
   */
  title: string;
  /**
   * status of the project
   */
  status: string;
  /**
   * status icon path
   */
  statusIcon?: string;
  /**
   * created time of the project
   */
  createdTime: string;
  /**
   * created time of the project
   */
  projectList: AutomationItem[];
  /**
   * created time of the project
   */
  setProjectList: Function;
  /**
   * a new instanciated project item
   */
  project: AutomationItem;
}

export type ActiveOptionProps = {
  title: string;
  okText: string;
  cancelText: string;
  disableOk?: boolean;
  disableCancel?: boolean;
  onOk: React.MouseEventHandler<HTMLElement>;
  type: LegacyButtonType;
  body?: any;
};

export interface IduplicateCheckBox {
  duplicate_configuration: boolean;
  duplicate_media: boolean;
}

function ProjectCard({ id, title, status, createdTime, project, projectList, setProjectList }: ProjectCardProps) {
  const logger = new Logger("ui-components:components:project-card:ProjectCard");
  const router = useRouter();
  const { t } = useTranslation();
  //  Modal Toggle state
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [, setAutomationId] = useUpdateAutomationId();
  const [modalName, setModalName] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [defaultAutomationName, setDefaultAutomationName] = useState("");
  const [, setAutomationType] = useAutomationType();
  const [, updateSmartCropStatus] = useAutomationStatus();
  const [, updateFaceCropName] = useGetandSetFaceCropName();
  const [, updateUnrecogCropName] = useGetandSetUnrecogCropName();
  const [, updateRemoveBgName] = useRemoveBgResizeAutomationName();

  useEffect(() => {
    logger.debug("automation type!", project.getType());
    if (project.getType().toLocaleLowerCase() === AutomationType.REMOVE_BG_RESIZE) {
      setDefaultAutomationName(DefaultAutomationName.REMOVE_BG_RESIZE as string);
    } else if (project.getType().toLocaleLowerCase() === AutomationType.SMART_CROP) {
      setDefaultAutomationName(DefaultAutomationName.SMART_CROP as string);
    } else if (project.getType().toLocaleLowerCase() === AutomationType.UNRECOGNIZABLE_CROP) {
      setDefaultAutomationName(DefaultAutomationName.UNRECOGNIZABLE_CROP as string);
    }
  }, [project]);

  //Rename option state
  const [projectName, setProjectName] = useState<string>(title);
  //Update the Project list with the new name
  const updateRenameList = useCallback(() => {
    let index = projectList.findIndex(x => x.getAutomationId() === id);
    if (index !== -1) {
      let tempArray: AutomationItem[] = projectList.slice();
      tempArray[index].setName(projectName);
      setProjectList(tempArray);
    }
  }, [id, projectList, projectName, setProjectList]);

  const onRename = useCallback(async () => {
    try {
      setIsLoading(true);
      let res = await API.renameAnAutomation(projectName, id);
      res.onResponse(data => {
        if (data.status === 200) {
          updateRenameList();
          setIsModalVisible(false);
          setIsLoading(false);
          toast("Automation Renamed");
        }
      });
    } catch (err) {
      // logger.debug(err);
    }
  }, [id, projectName, updateRenameList]);

  //Delete Option State
  const [deleteConfirm, setDeleteConfirm] = useState<string>("");
  //get the list and update it in frontend
  const updateDeletedList = useCallback(() => {
    let filteredProj = projectList.filter(x => x.getAutomationId() !== id);
    setProjectList(filteredProj);
  }, [id, projectList, setProjectList]);
  const onDelete = useCallback(async () => {
    if (deleteConfirm.toLowerCase().trim() === "delete") {
      try {
        setIsLoading(true);
        let res = await API.deleteAnAutomation(id);
        res.onResponse(data => {
          if (data.status === 200) {
            if (data?.data?.success === true) {
              updateDeletedList();
              setIsModalVisible(false);
              setIsLoading(false);
              toast(`${title} deleted`);
            }
          }
        });
        res.onError(err => {
          setIsModalVisible(false);
          setIsLoading(false);
          toast(err.detail, "error");
        });
        setDeleteConfirm("");
      } catch (err) {}
    }
  }, [deleteConfirm, id, updateDeletedList, title]);

  //Duplicate Option State
  const [duplicateCheckBox, setDuplicateCheckBox] = useState<IduplicateCheckBox>({
    duplicate_configuration: true,
    duplicate_media: true
  });
  //update the list with the new duplication item.
  const updateDuplicateList = useCallback(
    (data: AutomationItem) => {
      setProjectList([data, ...projectList]);
    },
    [projectList, setProjectList]
  );

  const onDuplicate = useCallback(async () => {
    try {
      setIsLoading(true);
      let res = await API.duplicateAnAutomation(id, duplicateCheckBox, defaultAutomationName);
      res.onResponse(data => {
        if (data.status === 200) {
          let automationItem = AutomationItem.toAutomationItem(data?.data);
          updateDuplicateList(automationItem as AutomationItem);
          setIsLoading(false);
          setIsModalVisible(false);
          toast(`${title} duplicated`);
        }
      });
    } catch (err) {}
  }, [id, duplicateCheckBox, defaultAutomationName, updateDuplicateList, title]);

  //Modal content for different options
  const modalContent: ActiveOptionProps = useMemo(() => {
    switch (modalName) {
      case "rename":
        return {
          title: "Rename",
          okText: "Rename",
          cancelText: "Cancel",
          disableOk: projectName.trim() === "" || projectName.trim() === title,
          onOk: onRename,
          type: "primary",
          body: (
            <RenameModalContent
              onEnter={onRename}
              setProjectName={setProjectName}
              projectName={projectName}
              errorMessage={errorMessage}
            />
          )
        };
      case "duplicate":
        return {
          title: "Duplicate",
          okText: "Duplicate",
          cancelText: "Cancel",
          disableOk: !duplicateCheckBox.duplicate_configuration && !duplicateCheckBox.duplicate_media,
          onOk: onDuplicate,
          type: "primary",
          body: (
            <DuplicateModalContent
              duplicateCheckBox={duplicateCheckBox}
              setDuplicateCheckBox={setDuplicateCheckBox}
              errorMessage={errorMessage}
              automationType={project.getType() as "SMART_CROP" | "REMOVE_BG_RESIZE" | "UNRECOGNIZABLE_CROP"}
            />
          )
        };
      case "delete":
        return {
          title: "Delete",
          okText: "Delete",
          cancelText: "Don't delete",
          disableOk: deleteConfirm.toLowerCase().trim() !== "delete" && true,
          onOk: onDelete,
          type: "danger",
          body: (
            <DeleteModalContent
              deleteConfirm={deleteConfirm}
              setDeleteConfirm={setDeleteConfirm}
              errorMessage={errorMessage}
              onEnter={onDelete}
            />
          )
        };
      default: {
        return {
          title: "",
          okText: "",
          cancelText: "",
          onOk: () => {},
          type: "default",
          body: <div>Something went wrong</div>
        };
      }
    }
  }, [modalName, projectName, title, onRename, errorMessage, duplicateCheckBox, onDuplicate, deleteConfirm, onDelete]);

  /**
   *
   *
   */

  function renameProject() {
    setModalName("rename");
    setProjectName(title);
    setIsModalVisible(true);
  }

  /**
   *
   *
   */
  function duplicateProject() {
    setModalName("duplicate");
    setDuplicateCheckBox({ duplicate_configuration: true, duplicate_media: true });
    setIsModalVisible(true);
  }

  /**
   *
   *
   */
  function deleteProject() {
    setDeleteConfirm("");
    setModalName("delete");
    setIsModalVisible(true);
  }

  const projectMenu = [
    {
      id: "rename",
      label: "Rename",
      onClick: renameProject
    },
    {
      id: "duplicate",
      label: "Duplicate",
      onClick: duplicateProject
    },
    {
      id: "delete",
      label: "Delete",
      onClick: deleteProject
    }
  ];

  /**
   *
   * @param projectStatus
   */
  function getStatusImage(projectStatus: string) {
    switch (projectStatus) {
      case AUTOMATION_STATUS.RUNNING:
        const antIcon = <LoadingOutlined style={{ fontSize: 16, color: "#fff" }} spin />;
        return <Spin indicator={antIcon} />;
      case AUTOMATION_STATUS.COMPLETED:
        return <img src="/images/completed.svg" alt="#" />;
      default:
        return "";
    }
  }

  function getProjectStatus(projectStatus: string) {
    if (project.isCompleted()) {
      return "Completed";
    }
    if (project.isNotConfigured()) {
      return "Not Started";
    }
    if (project.isConfigured()) {
      return "Not Started";
    }
    return projectStatus?.toLowerCase();
  }

  function handleClick() {
    let status = AUTOMATION_STATUS.NOT_CONFIGURED;
    // updateAutomationId(Number(project.getAutomationId()));
    if (project.isConfigured()) {
      status = AUTOMATION_STATUS.CONFIGURED;
    }
    updateSmartCropStatus(status);
    if (isUndefined(project.getAutomationId())) return;
    router.push(`/smart-crop?automationId=${project.getAutomationId()}`);
  }

  let currentStep: number = 0;
  const handleGoToRemoveBg = () => {
    if (project.getStatus() === AUTOMATION_STATUS.COMPLETED || project.getStatus() === AUTOMATION_STATUS.RUNNING) {
      currentStep = 3;
    }
    if (project.getN_asset() > 0 && project.getStatus() === AUTOMATION_STATUS.CONFIGURED) {
      currentStep = 2;
    }
    setAutomationId(project.getAutomationId());
    setAutomationType(AutomationType.REMOVE_BG_RESIZE);
    updateSmartCropStatus(project.getStatus());
    updateRemoveBgName(project.getName());
    router?.push(
      `/remove-bg-resize?automationId=${project.getAutomationId()}&editing=true&step=${currentStep}&status=${project.getStatus()}`
    );
  };

  const handleGoToUnrecogCrop = () => {
    if (project.getStatus() === AUTOMATION_STATUS.COMPLETED || project.getStatus() === AUTOMATION_STATUS.RUNNING) {
      currentStep = 4;
    }
    if (project.getN_asset() > 0 && project.getStatus() === AUTOMATION_STATUS.CONFIGURED) {
      currentStep = 3;
    }
    setAutomationId(project.getAutomationId());
    setAutomationType(AutomationType.UNRECOGNIZABLE_CROP);
    updateSmartCropStatus(project.getStatus());
    updateUnrecogCropName(project.getName());
    router?.push(
      `/unrecognizable-crop?automationId=${project.getAutomationId()}&editing=true&step=${currentStep}&status=${project.getStatus()}`
    );
  };

  const handleGoToFaceCrop = () => {
    if (project.getStatus() === AUTOMATION_STATUS.COMPLETED || project.getStatus() === AUTOMATION_STATUS.RUNNING) {
      currentStep = 5;
    }
    if (project.getN_asset() > 0 && project.getStatus() === AUTOMATION_STATUS.CONFIGURED) {
      currentStep = 4;
    }
    setAutomationId(project.getAutomationId());
    setAutomationType(AutomationType.SMART_CROP);
    updateSmartCropStatus(project.getStatus());
    updateFaceCropName(project.getName());
    router?.push(
      `/custom-face-crop?automationId=${project.getAutomationId()}&editing=true&step=${currentStep}&status=${project.getStatus()}`
    );
  };

  const handleClickProjectCard = () => {
    if (project.getType() === SMART_CROP_TYPE.REMOVE_BG_RESIZE) {
      handleGoToRemoveBg();
      return;
    }
    if (project.getType() === SMART_CROP_TYPE.UNRECOGNIZABLE_CROP) {
      handleGoToUnrecogCrop();
      return;
    }
    if (project.getType() === SMART_CROP_TYPE.SMART_CROP) {
      handleGoToFaceCrop();
      return;
    }
    handleClick();
  };

  return (
    <>
      <div className={styles.projectCard}>
        <div
          className={classnames(styles.projectDetail, {
            [styles.disabled]: project.isCompleted()
          })}
          onClick={handleClickProjectCard}
        >
          <div className={styles.projectStatus}>
            <div className={styles.status}>
              <span className={styles.statusIcon}>{getStatusImage(status || "")}</span>
              <span className={styles.statusName}>{getProjectStatus(status || "")}</span>
            </div>
            {project.getStatus() === AUTOMATION_STATUS.COMPLETED
              ? project?.getN_results() >= 0 && (
                  <Tooltip
                    title={
                      <div style={{ pointerEvents: "none" }}>
                        <div>
                          {t("home.assetTooltip", {
                            count: parseInt(project?.getN_asset() as string)
                          })}
                        </div>
                        <div>
                          {" "}
                          {t("home.resultTooltip", {
                            count: project?.getN_results()
                          })}
                        </div>
                      </div>
                    }
                    placement="topLeft"
                  >
                    <div className={styles.status}>
                      <span className={styles.statusIcon}>
                        <img src="/images/imageIcon.svg" />
                      </span>
                      <span className={styles.statusName}>
                        {project.getN_asset()}/{project.getN_results()}
                      </span>
                    </div>
                  </Tooltip>
                )
              : !!project.getN_asset() && (
                  <Tooltip
                    title={
                      <div>
                        {t("home.assetTooltip", {
                          count: parseInt(project?.getN_asset() as string)
                        })}
                      </div>
                    }
                    placement="topLeft"
                  >
                    <div className={styles.status}>
                      <span className={styles.statusIcon}>
                        <img src="/images/imageIcon.svg" />
                      </span>
                      <span className={styles.statusName}>{project.getN_asset()}</span>
                    </div>
                  </Tooltip>
                )}
          </div>
          <div className={styles.projectTitle}>
            <Tooltip title={title} placement="topLeft">
              <span>{title}</span>
            </Tooltip>
          </div>
        </div>
        <div className={styles.bottomOptions}>
          <div className={styles.createdTime}>Created {createdTime}</div>
          {/* <div className={styles.projectActions}>
            <Dropdown dropdownItems={projectMenu} triggerOn="hover" label={"..."} />
          </div> */}
          <div className={styles.options}>
            {projectMenu.map((menu, i) => (
              <Fragment key={i}>
                <div onClick={menu.onClick} className={styles.option}>
                  {menu.label}
                </div>
                {projectMenu.length - 1 !== i && <div className={styles.verticalBar}></div>}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
      <CustomModal
        title={`${modalContent.title} ${title}`}
        okText={modalContent.okText}
        cancelText={modalContent.cancelText}
        disableOk={modalContent.disableOk}
        visible={isModalVisible}
        onOk={modalContent.onOk}
        onCancel={() => setIsModalVisible(false)}
        type={modalContent.type}
        buttonLoading={isLoading}
        danger={modalContent.type === "danger"}
      >
        <>{modalContent.body}</>
      </CustomModal>
    </>
  );
}

export default ProjectCard;

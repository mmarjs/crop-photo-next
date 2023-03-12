/* eslint-disable react-hooks/exhaustive-deps */
import Form from "antd/lib/form";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import JobStartResponse from "../../models/JobStartResponse";
import { updateAutomationName, updateImageIds } from "../../redux/actions/smartcropActions";
import Optional from "../../util/Optional";

import LeftPanel from "../smart-crop-components/LeftPanel";
import RightPanel from "../smart-crop-components/RightPanel";
import {
  useBackgroundColor,
  useIsOnLargePreview,
  useRemoveBackground,
  useSelectedSize,
  useTransparency,
  useUpdateLatestJobId,
  useIsOpenEditPanel,
  useCustomBackgroundPaths
} from "../smart-crop-components/jotai";
import {
  useGetAutomationStatus,
  useOnReloadAutomationType,
  useResetCropConfig,
  useUpdateAutomationId
} from "../smart-crop-components/jotai/atomQueries";
import styles from "./remove-bg-resize.module.scss";
import {
  BackgroundConfiguration,
  CropConfigNames,
  EditRemoveBgResizeConfig,
  SMART_CROP_TYPE
} from "../smart-crop-components/jotai/atomTypes";
import { redirectToApplication } from "../../lib/navigation/routes";
import { toast } from "../components/toast";
import { AutomationType } from "../enums/AutomationType";
import {
  useRemoveBgResizeAutomationName,
  useRemoveBgResizeJobStartConfig
} from "../smart-crop-components/jotai/removeBgResize/atomStore";
import { useGetRemoveBgSizeConfig } from "../smart-crop-components/jotai/removeBgResize/atomQueries";
import {
  useStartRemoveBgResizeAutomation,
  useUpdateRemoveBgResizeConfig
} from "../smart-crop-components/jotai/removeBgResize/atomMutations";
import { Step1, Step2, Step3 } from "../smart-crop-components/Steps/BgResizeSteps";
import { isEmpty, omit } from "lodash";

interface RemoveBgResizeProps {
  type?: string;
}

function RemoveBgResize({ type }: RemoveBgResizeProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const router = useRouter();
  const { automationId, editing, step, jobId, status } = router?.query;
  const pathname = router?.pathname;
  const currentStep = Number(step);
  const [, setAddCustomIsDisplayed] = useState(false);
  const [bgFlag, setBgFlag] = useState(false);
  const [automationName, setAutomationName] = useRemoveBgResizeAutomationName();
  const [removeBackground, setRemoveBackground] = useRemoveBackground();
  const [selectedSizeAtom, setSelectedSizeAtom] = useSelectedSize();
  const [automationIdAtom, setAutomationId] = useUpdateAutomationId();
  const resetConfig = useResetCropConfig();
  const closePage = useRef<boolean>(false);
  const [hexColor] = useBackgroundColor();
  const [transparency] = useTransparency();
  const [isOnLargePreview] = useIsOnLargePreview();
  const [isOpenEditPanel] = useIsOpenEditPanel();
  const [latestJobId, updateJobId] = useUpdateLatestJobId();
  const jobStartConfig = useRemoveBgResizeJobStartConfig(automationId as string);
  const { refetch } = useGetAutomationStatus(automationId as string);
  const [customBackgroundPaths] = useCustomBackgroundPaths();

  useGetRemoveBgSizeConfig(editing === "true", automationId as string);
  useOnReloadAutomationType(AutomationType.REMOVE_BG_RESIZE);

  const { mutate: startRemoveBgResizeAutomation, isLoading: isStartingAutomation } = useStartRemoveBgResizeAutomation({
    onSuccess: (data: Optional<JobStartResponse>) => {
      const jobStartResponse = data?.get();
      const jobId = jobStartResponse?.getJobId();
      if (!!jobId) {
        updateJobId(jobId);
        updateAutomationName(automationName);
        router?.push(
          `${pathname}?automationId=${automationId}&editing=${editing}&step=3&status=RUNNING&jobId=${jobId}`
        );
        refetch();
      }
    },
    onError: (error: any) => {
      toast(error?.message ?? error.toString(), "error");
    }
  });

  useEffect(() => {
    return () => {
      resetConfig();
      updateImageIds([]);
      updateJobId("");
      closePage.current = false;
    };
  }, []);

  // set automation id on reload
  useEffect(() => {
    if (!!automationIdAtom) {
      setAutomationId(automationId as string);
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [automationId, automationIdAtom]);

  useEffect(() => {
    if (!latestJobId && !!jobId) {
      updateJobId(jobId as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestJobId]);

  useEffect(() => {
    if (currentStep === 0 && !bgFlag) {
      setRemoveBackground(true);
      setBgFlag(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, bgFlag]);

  const onAutomationNameChange = (value: string) => {
    setAutomationName(value);
  };

  const onFieldChange = useMemo(() => {
    return (values: any, allValues: any) => {
      let sizeArr = [] as Array<string>;
      let flag = true;
      allValues.map((field: any) => {
        if (
          (field?.name[0] === "original" && field?.value) ||
          (field?.name[0] === "customFormats" && field?.value?.length > 0)
        ) {
          flag = false;
        }
        if (field?.name[0] === "original" && !!field?.value) {
          sizeArr = sizeArr.concat("Original");
        }
        if (field?.name[0] === "customFormats" && Array.isArray(field?.value)) {
          sizeArr = sizeArr.concat(field.value);
        }
      });
      setSelectedSizeAtom(sizeArr);
    };
  }, [setSelectedSizeAtom]);

  useEffect(() => form.resetFields(), [selectedSizeAtom]);

  const handleShowAddCustom = useCallback((show: boolean) => {
    setAddCustomIsDisplayed(show);
  }, []);

  const stepNames: string[] = [
    t("configuration.left_panel.bg_settings"),
    t("configuration.left_panel.output_size_settings"),
    t("configuration.left_panel.review_step")
  ];

  const handleEditCropMarker = () => {};
  const handeEditBgSettings = () => {
    router.push(`${pathname}?automationId=${automationId}&editing=${Boolean(editing)}&step=0&status=CONFIGURED`);
  };
  const handleEditOutputSizes = () => {
    router.push(`${pathname}?automationId=${automationId}&editing=${Boolean(editing)}&step=1&status=CONFIGURED`);
  };

  const displayStepComponent = useMemo(() => {
    switch (currentStep) {
      case 0:
        return <Step1 removeBackground={removeBackground} />;
      case 1:
        return (
          <Step2 form={form} onFieldChange={onFieldChange} onShowAddCustom={handleShowAddCustom} isSmartCrop={false} />
        );
      case 2:
      case 3:
        return (
          <Step3
            stepsLength={stepNames.length}
            onEditBgSettings={handeEditBgSettings}
            onEditCropmarker={handleEditCropMarker}
            onEditOutputSizes={handleEditOutputSizes}
          />
        );
      default:
        break;
    }
  }, [
    currentStep,
    removeBackground,
    form,
    onFieldChange,
    handleShowAddCustom,
    stepNames.length,
    handeEditBgSettings,
    handleEditOutputSizes
  ]);

  const { mutate: updateConfig, isLoading: isUpdatingConfig } = useUpdateRemoveBgResizeConfig({
    onSettled: () => {
      if (closePage?.current) {
        redirectToApplication(router);
        return;
      }
      const nextStep = currentStep + 1;
      router.push(
        `${pathname}?automationId=${automationId}&editing=${Boolean(editing)}&step=${nextStep}&status=CONFIGURED`
      );
    },
    onError: (error: any) => {
      console.error("useAutosave error", error);
      toast(error?.message ?? error.toString(), "error");
    }
  });

  const customSizes = useMemo(() => {
    if (selectedSizeAtom?.length > 0) {
      const allCustomSizes = selectedSizeAtom.filter(size => size?.toLowerCase() !== "original");
      if (!!allCustomSizes && allCustomSizes?.length > 0) {
        return allCustomSizes.map(size => {
          const height = size.split("x")[1];
          const width = size.split("x")[0];
          return {
            crop_config_name: CropConfigNames.CUSTOM_NAME,
            maintain_aspect_ratio: true,
            allow_padding: true,
            media_size: {
              width: Number(width),
              height: Number(height)
            }
          };
        });
      }
      return [];
    }
    return [];
  }, [selectedSizeAtom]);

  const mediaConversionOptions = useMemo(() => {
    if (selectedSizeAtom?.length > 0) {
      const hasOriginal = selectedSizeAtom.indexOf("Original") !== -1;
      if (hasOriginal) {
        return [
          {
            crop_config_name: CropConfigNames.ORIGINAL,
            media_size: null,
            allow_padding: true,
            maintain_aspect_ratio: true
          },
          ...customSizes
        ];
      }
      return customSizes;
    }
    return [];
  }, [customSizes, selectedSizeAtom]);

  const updatedCropConfig: EditRemoveBgResizeConfig = useMemo(() => {
    let bgConfig: BackgroundConfiguration = {
      schema: 1,
      remove_background: removeBackground,
      background_color: hexColor as string,
      transparency: transparency,
      step: 2,
      custom_background_image_paths: customBackgroundPaths as string[],
      type: "BG"
    };
    if (isEmpty(hexColor)) {
      bgConfig = { ...omit(bgConfig, ["background_color"]) };
    }
    let newVar: EditRemoveBgResizeConfig = {
      automation: {
        id: automationId as string,
        name: automationName.trim().length === 0 ? "Untitled Smart Resize + Background Remove" : automationName,
        type: SMART_CROP_TYPE.REMOVE_BG_RESIZE,
        status: "CONFIGURED"
      },
      remove_bg_resize_configuration: {
        background_configuration: bgConfig,
        download_configuration: {
          schema: 1,
          media_conversion_options: mediaConversionOptions,
          step: 3,
          type: "DOWNLOAD"
        }
      }
    };
    return newVar;
  }, [
    automationId,
    automationName,
    hexColor,
    mediaConversionOptions,
    removeBackground,
    transparency,
    customBackgroundPaths
  ]);

  const onStartCrop = useCallback(() => {
    if (!jobStartConfig) return;
    startRemoveBgResizeAutomation(jobStartConfig);
  }, [jobStartConfig, startRemoveBgResizeAutomation]);

  const saveOnNext = useCallback(
    (isToClose?: boolean) => {
      if (isToClose) {
        closePage.current = true;
      }

      if (status === "COMPLETED" || status === "RUNNING") return;
      updateConfig(updatedCropConfig as EditRemoveBgResizeConfig);
    },
    [updateConfig, updatedCropConfig, status]
  );

  return (
    <>
      <div className={styles.wrapper}>
        {!isOnLargePreview ? (
          <LeftPanel
            currentStep={currentStep}
            displayStepComponent={displayStepComponent}
            loading={isStartingAutomation || isUpdatingConfig}
            stepNames={stepNames}
            onStartCrop={onStartCrop}
            type={type}
            automationName={automationName}
            onAutomationNameChange={onAutomationNameChange}
            editableNamePlaceholder="Name of Untitled Smart Resize + Background Remove"
            onNext={saveOnNext}
            page="BgResizeCrop"
          />
        ) : null}
        <RightPanel
          showImageViewer={currentStep < 2}
          showUploadPanel={currentStep === 2}
          showSummary={currentStep === 3 && !isOpenEditPanel}
          automationName={automationName}
          showEditPanel={isOpenEditPanel}
        />
      </div>
    </>
  );
}

export default RemoveBgResize;

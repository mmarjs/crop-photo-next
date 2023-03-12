import Form from "antd/lib/form";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { redirectToApplication } from "../../lib/navigation/routes";
import JobStartResponse from "../../models/JobStartResponse";
import Optional from "../../util/Optional";
import { toast } from "../components/toast";
import {
  useRemoveBackground,
  useSelectedSize,
  useCropMarker,
  useCropArea,
  useBackgroundColor,
  useTransparency,
  useIsOnLargePreview,
  useBodyPartDetection,
  useUpdateLatestJobId,
  useIsOpenEditPanel,
  useCustomBackgroundPaths
} from "../smart-crop-components/jotai";

import { useOnReloadAutomationType, useResetCropConfig } from "../smart-crop-components/jotai/atomQueries";
import {
  BackgroundConfiguration,
  CropConfigNames,
  EditUnrecognizableCropConfig,
  SMART_CROP_TYPE
} from "../smart-crop-components/jotai/atomTypes";
import LeftPanel from "../smart-crop-components/LeftPanel";
import RightPanel from "../smart-crop-components/RightPanel";
import styles from "./UnrecognizableCrop.module.scss";
import { AutomationType } from "../enums/AutomationType";
import {
  useGetandSetUnrecogCropName,
  useUnrecognizableCropJobStartConfig
} from "../smart-crop-components/jotai/unrecognizableCrop/atomStore";
import { useGetUnrecognizableCropConfig } from "../smart-crop-components/jotai/unrecognizableCrop/atomQueries";
import {
  useStartUnrecognizableCropAutomation,
  useUpdateUnrecognizableCropConfig
} from "../smart-crop-components/jotai/unrecognizableCrop/atomMutations";
import { Step1, Step2, Step3, Step4 } from "../smart-crop-components/Steps/UnrecognizableCropSteps";
import { isEmpty, omit } from "lodash";
import { Logger } from "aws-amplify";

const logger = new Logger("ui-components:unrecognizable-crop:index");

function UnrecognizableCrop() {
  const [form] = Form.useForm();
  const router = useRouter();
  const { automationId, editing, step, jobId, status } = router?.query;
  const { t } = useTranslation();
  const [automationName, setAutomationName] = useGetandSetUnrecogCropName();
  const [, setAddCustomIsDisplayed] = useState(false);
  const [bgFlag, setBgFlag] = useState(false);
  const closePage = useRef<boolean>(false);
  const pathname = router?.pathname;
  const [removeBackground, setRemoveBackground] = useRemoveBackground();
  const [cropMarker] = useCropMarker();
  const [cropArea] = useCropArea();
  const [bodyPartsDetection] = useBodyPartDetection();
  const [hexColor] = useBackgroundColor();
  const [transparency] = useTransparency();
  const [selectedSizes, setSelectedSizes] = useSelectedSize();
  const resetConfig = useResetCropConfig();
  const currentStep = Number(step as string);
  const jobStartConfig = useUnrecognizableCropJobStartConfig(automationId as string);
  const [isOnLargePreview] = useIsOnLargePreview();
  const [isOpenEditPanel] = useIsOpenEditPanel();
  const [latestJobId, updateJobId] = useUpdateLatestJobId();
  const [customBackgroundS3Path] = useCustomBackgroundPaths();

  useOnReloadAutomationType(AutomationType.UNRECOGNIZABLE_CROP);
  useGetUnrecognizableCropConfig(editing === "true", automationId as string);

  const { mutate: startUnrecognizableCropAutomation, isLoading: isStartingAutomation } =
    useStartUnrecognizableCropAutomation({
      onSuccess: (data: Optional<JobStartResponse>) => {
        const jobStartResponse = data?.get();
        const jobId = jobStartResponse?.getJobId();
        if (!!jobId) {
          updateJobId(jobId);
          setAutomationName(automationName);
          router?.push(
            `${pathname}?automationId=${automationId}&editing=${editing}&step=4&status=RUNNING&jobId=${jobId}`
          );
        }
      },
      onError: (error: any) => {
        toast(error?.message ?? error.toString(), "error");
      }
    });
  const { mutate: updateConfig, isLoading: isUpdatingConfig } = useUpdateUnrecognizableCropConfig({
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
    if (selectedSizes?.length > 0) {
      const allCustomSizes = selectedSizes.filter(size => size?.toLowerCase() !== "original");
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
  }, [selectedSizes]);

  const mediaConversionOptions = useMemo(() => {
    if (selectedSizes?.length > 0) {
      const hasOriginal = selectedSizes.indexOf("Original") !== -1;
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
  }, [customSizes, selectedSizes]);

  useEffect(() => {
    return () => {
      resetConfig();
      closePage.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!latestJobId && !!jobId) {
      updateJobId(jobId as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestJobId]);

  useEffect(() => {
    if (currentStep === 1 && !bgFlag && (!editing || editing !== "true")) {
      setRemoveBackground(true);
      setBgFlag(true);
    }
  }, [currentStep, bgFlag, editing, setRemoveBackground]);

  useEffect(() => form.resetFields(), [selectedSizes, form]);

  const onAutomationNameChange = useCallback(
    (name: string) => {
      setAutomationName(name);
    },
    [setAutomationName]
  );

  const onFieldChange = useCallback(
    (values: any, allValues: any) => {
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
      setSelectedSizes(sizeArr);
    },
    [setSelectedSizes]
  );

  const handleShowAddCustom = useCallback((show: boolean) => {
    setAddCustomIsDisplayed(show);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stepNames: string[] = [
    t("configuration.left_panel.marker_settings"),
    t("configuration.left_panel.bg_settings"),
    t("configuration.left_panel.output_size_settings"),
    t("configuration.left_panel.review_step")
  ];

  const handleEditCropMarker = useCallback(() => {
    router.push(`${pathname}?automationId=${automationId}&editing=${Boolean(editing)}&step=0&status=CONFIGURED`);
  }, [automationId, editing, pathname, router]);

  const handeEditBgSettings = useCallback(() => {
    router.push(`${pathname}?automationId=${automationId}&editing=${Boolean(editing)}&step=1&status=CONFIGURED`);
  }, [automationId, editing, pathname, router]);

  const handleEditOutputSizes = useCallback(() => {
    router.push(`${pathname}?automationId=${automationId}&editing=${Boolean(editing)}&step=2&status=CONFIGURED`);
  }, [automationId, editing, pathname, router]);

  const displayStepComponent = useMemo(() => {
    switch (currentStep) {
      case 0:
        return <Step1 />;

      case 1:
        return <Step2 removeBackground={removeBackground} />;

      case 2:
        return <Step3 form={form} onFieldChange={onFieldChange} onShowAddCustom={handleShowAddCustom} />;
      case 3:
      case 4:
      case 5:
        return (
          <Step4
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
    handleEditCropMarker,
    handleEditOutputSizes
  ]);
  logger.info("customBackgroundS3Path:", customBackgroundS3Path);
  const updatedCropConfig: EditUnrecognizableCropConfig = useMemo(() => {
    let bgConfig: BackgroundConfiguration = {
      schema: 1,
      remove_background: removeBackground,
      background_color: hexColor as string,
      transparency: transparency,
      step: 2,
      custom_background_image_paths: customBackgroundS3Path as string[],
      type: "BG"
    };
    if (isEmpty(hexColor)) {
      bgConfig = { ...omit(bgConfig, ["background_color"]) };
    }
    return {
      automation: {
        id: automationId as string,
        name: automationName.trim().length === 0 ? "Untitled Unrecognizable Crop" : automationName,
        type: SMART_CROP_TYPE.UNRECOGNIZABLE_CROP,
        status: "CONFIGURED"
      },
      unrecognizable_crop_configuration: {
        crop_configuration: {
          schema: 1,
          step: 1,
          type: "CROP",
          marker: cropMarker,
          crop_type: "CROP_FROM",
          crop_around_config: {
            position_x: 0,
            position_y: 0,
            crop_side: cropArea
          },
          crop_from_config: {
            include_markers_boundary: false,
            crop_side_values: cropArea,
            crop_side: "BOTTOM"
          },
          enable_body_parts_detection: bodyPartsDetection as boolean
        },
        background_configuration: bgConfig,
        download_configuration: {
          schema: 1,
          media_conversion_options: mediaConversionOptions,
          step: 3,
          type: "DOWNLOAD"
        }
      }
    };
  }, [
    automationId,
    automationName,
    bodyPartsDetection,
    cropArea,
    cropMarker,
    customBackgroundS3Path,
    hexColor,
    mediaConversionOptions,
    removeBackground,
    transparency
  ]);

  const onStartCrop = useCallback(() => {
    if (!jobStartConfig) return;
    startUnrecognizableCropAutomation(jobStartConfig);
  }, [jobStartConfig, startUnrecognizableCropAutomation]);

  const saveOnNext = useCallback(
    (isToClose?: boolean) => {
      if (isToClose) {
        closePage.current = true;
      }
      if (status === "COMPLETED" || status === "RUNNING") return;
      updateConfig(updatedCropConfig as EditUnrecognizableCropConfig);
    },
    [status, updateConfig, updatedCropConfig]
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
            onAutomationNameChange={onAutomationNameChange}
            automationName={automationName}
            editableNamePlaceholder="Name of Unrecognizable Crop"
            onNext={saveOnNext}
            page="UnrecognizableCrop"
          />
        ) : null}
        <RightPanel
          showImageViewer={currentStep < 3}
          showUploadPanel={currentStep === 3}
          showSummary={currentStep === 4 && !isOpenEditPanel}
          showEditPanel={isOpenEditPanel}
          automationName={automationName}
        />
      </div>
    </>
  );
}

export default UnrecognizableCrop;

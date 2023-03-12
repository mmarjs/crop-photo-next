import { useRouter } from "next/router";
import Form from "antd/lib/form";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useBackgroundColor,
  useBodyPartDetection,
  useCropArea,
  useCropMarker,
  useIsOnLargePreview,
  useRemoveBackground,
  useTransparency,
  useUpdateLatestJobId,
  useIsOpenEditPanel,
  useCustomBackgroundPaths
} from "../smart-crop-components/jotai";
import {
  useCropSideAtom,
  useCropTypeAtom,
  useCustomFaceCropJobStartConfig,
  useGetandSetFaceCropName
} from "../smart-crop-components/jotai/customFaceCrop/atomStore";
import LeftPanel from "../smart-crop-components/LeftPanel";
import RightPanel from "../smart-crop-components/RightPanel";
import { useSelectedSize } from "../smart-crop-components/jotai";
import { Step1, Step2, Step3, Step4, Step5 } from "../smart-crop-components/Steps/CustomFaceCropSteps";
import styles from "./custom-face-crop.module.scss";
import {
  SMART_CROP_TYPE,
  EditCustomFaceCropConfig,
  CropConfigNames,
  CropSide,
  BackgroundConfiguration
} from "../smart-crop-components/jotai/atomTypes";
import {
  useStartCustomFacepAutomation,
  useUpdateCustomFaceCropConfig
} from "../smart-crop-components/jotai/customFaceCrop/atomMutations";
import { toast } from "../components/toast";
import { redirectToApplication } from "../../lib/navigation/routes";
import JobStartResponse from "../../models/JobStartResponse";
import Optional from "../../util/Optional";
import { useGetFaceCropConfig } from "../smart-crop-components/jotai/customFaceCrop/atomQueries";
import { useOnReloadAutomationType, useResetCropConfig } from "../smart-crop-components/jotai/atomQueries";
import { AutomationType } from "../enums/AutomationType";
import { isEmpty, omit } from "lodash";

interface CustomSmartCropProps {
  type?: string;
}

const CustomSmartCrop: FC<CustomSmartCropProps> = ({ type }) => {
  const router = useRouter();
  const { push, pathname, query } = router;
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const { automationId, editing, step, jobId } = query;
  const [bgFlag, setBgFlag] = useState(false);
  const currentStep = Number(step);
  const [isOnLargePreview] = useIsOnLargePreview();
  const [isOpenEditPanel] = useIsOpenEditPanel();
  const [automationName, setAutomationName] = useGetandSetFaceCropName();
  const [selectedSizes, setSelectedSizes] = useSelectedSize();
  const [, setAddCustomIsDisplayed] = useState(false);
  const [cropMarker] = useCropMarker();
  const [cropType] = useCropTypeAtom();
  const [cropArea] = useCropArea();
  const [cropSide] = useCropSideAtom();
  const [removeBackground, setRemoveBackground] = useRemoveBackground();
  const [hexColor] = useBackgroundColor();
  const [transparency] = useTransparency();
  const closePage = useRef<boolean>(false);

  const { mutate: updateConfig } = useUpdateCustomFaceCropConfig();
  const { mutate: startCropAutomation } = useStartCustomFacepAutomation();
  const [, updateAutomationName] = useGetandSetFaceCropName();
  const [latestJobId, updateJobId] = useUpdateLatestJobId();
  const customConfig = useCustomFaceCropJobStartConfig(automationId as string);
  const [bodyPartsDetection] = useBodyPartDetection();
  const resetConfig = useResetCropConfig();
  const [customBackgroundPaths] = useCustomBackgroundPaths();

  useGetFaceCropConfig(editing === "true", automationId as string);
  useOnReloadAutomationType(AutomationType.SMART_CROP);

  const stepNames: string[] = [
    t("configuration.left_panel.crop_type.label"),
    t("configuration.left_panel.marker_settings"),
    t("configuration.left_panel.bg_settings"),
    t("configuration.left_panel.output_size_settings"),
    t("configuration.left_panel.review_step")
  ];

  useEffect(() => {
    return () => {
      resetConfig();
      closePage.current = false;
    };
  }, []);

  useEffect(() => {
    if (!latestJobId && !!jobId) {
      updateJobId(jobId as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestJobId, jobId]);

  useEffect(() => {
    if (currentStep === 2 && !bgFlag && (!editing || editing !== "true")) {
      setRemoveBackground(true);
      setBgFlag(true);
    }
  }, [currentStep, bgFlag, editing, setRemoveBackground]);

  useEffect(() => form.resetFields(), [selectedSizes, form]);

  const handleEditCropMarker = useCallback(() => {
    push(`${pathname}?automationId=${automationId}&editing=${Boolean(editing)}&step=1&status=CONFIGURED`);
  }, [automationId, editing, pathname, push]);

  const handeEditBgSettings = useCallback(() => {
    push(`${pathname}?automationId=${automationId}&editing=${Boolean(editing)}&step=2&status=CONFIGURED`);
  }, [automationId, editing, pathname, push]);

  const handleEditOutputSizes = useCallback(() => {
    push(`${pathname}?automationId=${automationId}&editing=${Boolean(editing)}&step=3&status=CONFIGURED`);
  }, [automationId, editing, pathname, push]);

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

  const onStartCrop = useCallback(() => {
    if (!customConfig) return;
    startCropAutomation(customConfig, {
      onSuccess: (data: Optional<JobStartResponse>) => {
        const jobStartResponse = data?.get();
        const jobId = jobStartResponse?.getJobId();
        if (!!jobId) {
          updateJobId(jobId);
          updateAutomationName(automationName);
          push(`${pathname}?automationId=${automationId}&editing=${editing}&step=5&status=RUNNING&jobId=${jobId}`);
        }
      },
      onError: (error: any) => {
        toast(error?.message ?? error.toString(), "error");
      }
    });
  }, [
    push,
    customConfig,
    startCropAutomation,
    updateJobId,
    updateAutomationName,
    automationName,
    pathname,
    automationId,
    editing
  ]);

  const onAutomationNameChange = useCallback(
    (value: string) => {
      setAutomationName(value);
    },
    [setAutomationName]
  );

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

  const updatedCropConfig: EditCustomFaceCropConfig = useMemo(() => {
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
    return {
      automation: {
        id: automationId as string,
        name: automationName.trim().length === 0 ? "Untitled Custom Face Crop" : automationName,
        type: SMART_CROP_TYPE.SMART_CROP,
        status: "CONFIGURED"
      },
      smart_crop_automation_configuration: {
        crop_configuration: {
          schema: 1,
          step: 1,
          type: "CROP",
          marker: cropMarker,
          crop_type: cropType as "CROP_FROM" | "CROP_AROUND",
          crop_around_config: {
            position_x: 0,
            position_y: 0,
            crop_side: cropArea
          },
          crop_from_config: {
            include_markers_boundary: false,
            crop_side_values: cropArea,
            crop_side: cropSide as CropSide
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
    cropMarker,
    cropType,
    cropArea,
    cropSide,
    bodyPartsDetection,
    removeBackground,
    hexColor,
    transparency,
    customBackgroundPaths,
    mediaConversionOptions
  ]);

  const saveOnNext = useCallback(
    (isToClose?: boolean) => {
      if (status === "COMPLETED" || status === "RUNNING") return;

      updateConfig(updatedCropConfig as EditCustomFaceCropConfig, {
        onSettled: () => {
          if (isToClose) {
            redirectToApplication(router);
            return;
          }
          const nextStep = currentStep + 1;
          push(
            `${pathname}?automationId=${automationId}&editing=${Boolean(editing)}&step=${nextStep}&status=CONFIGURED`
          );
        },
        onError: (error: any) => {
          toast(error?.message ?? error.toString(), "error");
        }
      });
    },
    [updateConfig, updatedCropConfig, currentStep, push, pathname, automationId, editing, router]
  );

  const displayStepComponent = useMemo(() => {
    switch (currentStep) {
      case 0:
        return <Step1 />;
      case 1:
        return <Step2 />;
      case 2:
        return <Step3 />;
      case 3:
        return <Step4 form={form} onFieldChange={onFieldChange} onShowAddCustom={handleShowAddCustom} />;

      case 4:
      case 5:
      case 6:
        return (
          <Step5
            stepsLength={stepNames.length}
            onEditBgSettings={handeEditBgSettings}
            onEditCropmarker={handleEditCropMarker}
            onEditOutputSizes={handleEditOutputSizes}
          />
        );

      default:
        return <div />;
    }
  }, [
    currentStep,
    form,
    handeEditBgSettings,
    handleEditCropMarker,
    handleEditOutputSizes,
    handleShowAddCustom,
    onFieldChange,
    stepNames.length
  ]);

  return (
    <div className={styles.wrapper}>
      {!isOnLargePreview ? (
        <LeftPanel
          currentStep={currentStep}
          displayStepComponent={displayStepComponent}
          loading={false}
          stepNames={stepNames}
          onStartCrop={onStartCrop}
          type={type}
          automationName={automationName}
          onAutomationNameChange={onAutomationNameChange}
          editableNamePlaceholder="Name of Untitled Custom Smart Crop"
          onNext={saveOnNext}
          page="CustomSmartCrop"
        />
      ) : null}
      <RightPanel
        showImageViewer={currentStep < 4}
        showUploadPanel={currentStep === 4}
        showSummary={currentStep === 5 && !isOpenEditPanel}
        automationName={automationName}
        showEditPanel={isOpenEditPanel}
      />
    </div>
  );
};

export default CustomSmartCrop;

import { atom, useAtom, useAtomValue } from "jotai";
import { atomWithReset, useResetAtom } from "jotai/utils";
import {
  useBackgroundColor,
  useBodyPartDetection,
  useCropArea,
  useCropMarker,
  useRemoveBackground,
  useSelectedSize,
  useTransparency,
  useCustomBackgroundPaths
} from "..";
import { useMemo } from "react";
import {
  CreateUnrecognizableCropConfig,
  CropConfigNames,
  EditUnrecognizableCropConfig,
  JobStartConfiguration,
  SMART_CROP_TYPE
} from "../atomTypes";

export const unrecogCropAutomationName = atomWithReset<string>("");
export const getAndUpdateUnrecognizableCropName = atom(
  get => get(unrecogCropAutomationName),
  (_get, set, name: string) => set(unrecogCropAutomationName, name)
);
export const useGetandSetUnrecogCropName = () => useAtom(getAndUpdateUnrecognizableCropName);
export const useResetUnrecognizableCropAutomationName = () => useResetAtom(unrecogCropAutomationName);

export const useNewUnrecognizableCropConfig = (enabled: boolean) => {
  const [cropMarker] = useCropMarker();
  const [cropArea] = useCropArea();
  const [hexColor] = useBackgroundColor();
  const [removeBackground] = useRemoveBackground();
  const [transparency] = useTransparency();
  const [bodyPartDetection] = useBodyPartDetection();
  const [customBackgroundS3Path] = useCustomBackgroundPaths();

  return useMemo(() => {
    const config: CreateUnrecognizableCropConfig = {
      automation: {
        name: "Untitled Unrecognizable Crop",
        type: SMART_CROP_TYPE.UNRECOGNIZABLE_CROP
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
          enable_body_parts_detection: bodyPartDetection as boolean
        },
        background_configuration: {
          schema: 1,
          remove_background: removeBackground,
          background_color: hexColor,
          transparency: transparency,
          step: 2,
          custom_background_image_paths: customBackgroundS3Path,
          type: "BG"
        },
        download_configuration: {
          schema: 1,
          media_conversion_options: [
            {
              crop_config_name: CropConfigNames.ORIGINAL,
              media_size: null,
              maintain_aspect_ratio: true,
              allow_padding: true
            }
          ],
          step: 3,
          type: "DOWNLOAD"
        }
      }
    };
    return config;
  }, [cropMarker, cropArea, hexColor, removeBackground, transparency, bodyPartDetection, customBackgroundS3Path]);
};

export const useEditedUnrecognizableCropConfig = (automationId: string): EditUnrecognizableCropConfig | undefined => {
  const [cropMarker] = useCropMarker();
  const [cropArea] = useCropArea();
  const [bodyPartDetection] = useBodyPartDetection();
  const [hexColor] = useBackgroundColor();
  const [removeBackground] = useRemoveBackground();
  const [transparency] = useTransparency();
  const automationName = useAtomValue(unrecogCropAutomationName);
  const [selectedSizes] = useSelectedSize();
  const [customBackgroundPath] = useCustomBackgroundPaths();
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

  return useMemo(() => {
    if (automationId) {
      const config: EditUnrecognizableCropConfig = {
        automation: {
          id: automationId,
          name: automationName,
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
            enable_body_parts_detection: bodyPartDetection as boolean
          },
          background_configuration: {
            schema: 1,
            remove_background: removeBackground,
            background_color: hexColor,
            transparency: transparency,
            step: 2,
            custom_background_image_paths: customBackgroundPath,
            type: "BG"
          },
          download_configuration: {
            schema: 1,

            media_conversion_options: mediaConversionOptions,
            step: 3,
            type: "DOWNLOAD"
          }
        }
      };
      return config;
    }
    return undefined;
  }, [
    customBackgroundPath,
    automationId,
    automationName,
    cropMarker,
    cropArea,
    bodyPartDetection,
    removeBackground,
    hexColor,
    transparency,
    mediaConversionOptions
  ]);
};

export const useUnrecognizableCropJobStartConfig = (automationId: string) => {
  const [selectedSizes] = useSelectedSize();
  const [transparency] = useTransparency();
  const [hexColor] = useBackgroundColor();

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

  return useMemo(() => {
    if (automationId) {
      const config: JobStartConfiguration = {
        automationId: automationId as string,
        config: {
          schema: 1,
          smart_crop_download_options: {
            media_conversion_options: mediaConversionOptions,
            allow_padding: true,
            padding_color: hexColor,
            transparency
          }
        }
      };
      return config;
    }
    return undefined;
  }, [hexColor, mediaConversionOptions, transparency, automationId]);
};

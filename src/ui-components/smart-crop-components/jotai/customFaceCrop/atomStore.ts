import { atom, useAtom, useAtomValue } from "jotai";
import { atomWithReset, useResetAtom } from "jotai/utils";
import { CreateCustomFaceCropConfig, CropSide, CROP_TYPES, DIRECTION, EditCustomFaceCropConfig } from "../atomTypes";
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
import { CropConfigNames, JobStartConfiguration, SMART_CROP_TYPE } from "../atomTypes";

export const faceCropName = atomWithReset<string>("");
export const getAndUpdatefaceCropName = atom(
  get => get(faceCropName),
  (_get, set, name: string) => set(faceCropName, name)
);
export const useGetandSetFaceCropName = () => useAtom(getAndUpdatefaceCropName);
export const useResetFaceCropAutomationName = () => useResetAtom(faceCropName);

export const cropTypeAtom = atomWithReset<"CROP_FROM" | "CROP_AROUND" | string>(CROP_TYPES.CROP_FROM);
export const updateCropTypeAtom = atom(
  get => get(cropTypeAtom),
  (_, set, cropType: string) => set(cropTypeAtom, cropType)
);
export const useCropTypeAtom = () => useAtom(updateCropTypeAtom);
export const useResetCropTypeAtom = () => useResetAtom(cropTypeAtom);

export const cropSideAtom = atomWithReset<string>(DIRECTION.BOTTOM);
export const updateCropSideAtom = atom(
  get => get(cropSideAtom),
  (_, set, cropSide: string) => set(cropSideAtom, cropSide)
);
export const useCropSideAtom = () => useAtom(updateCropSideAtom);
export const useResetCropSideAtom = () => useResetAtom(cropSideAtom);

export const useNewFaceCropConfig = (enabled: boolean) => {
  const [cropMarker] = useCropMarker();
  const [cropSide] = useCropSideAtom();
  const [cropArea] = useCropArea();
  const [hexColor] = useBackgroundColor();
  const [removeBackground] = useRemoveBackground();
  const [transparency] = useTransparency();
  const [bodyPartDetection] = useBodyPartDetection();
  const [cropType] = useCropTypeAtom();
  const [customBackgroundPaths] = useCustomBackgroundPaths();

  return useMemo(() => {
    const config: CreateCustomFaceCropConfig = {
      automation: {
        name: "Untitled Custom Face Crop",
        type: SMART_CROP_TYPE.SMART_CROP
      },
      smart_crop_automation_configuration: {
        crop_configuration: {
          schema: 1,
          step: 1,
          type: "CROP",
          marker: cropMarker,
          crop_type: cropType as "CROP_FROM" | "CROP_AROUND",
          crop_around_config: {
            position_x: 50,
            position_y: 50,
            crop_side: cropArea
          },
          crop_from_config: {
            include_markers_boundary: false,
            crop_side_values: cropArea,
            crop_side: cropSide as CropSide
          },
          enable_body_parts_detection: bodyPartDetection as boolean
        },
        background_configuration: {
          schema: 1,
          remove_background: removeBackground,
          background_color: hexColor,
          transparency: transparency,
          step: 2,
          custom_background_image_paths: customBackgroundPaths,
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
  }, [
    cropMarker,
    cropType,
    cropArea,
    cropSide,
    bodyPartDetection,
    removeBackground,
    hexColor,
    transparency,
    customBackgroundPaths
  ]);
};

export const useEditedFaceCropConfig = (automationId: string): EditCustomFaceCropConfig | undefined => {
  const [cropType] = useCropTypeAtom();
  const [cropSide] = useCropSideAtom();

  const [cropMarker] = useCropMarker();
  const [cropArea] = useCropArea();
  const [bodyPartDetection] = useBodyPartDetection();
  const [hexColor] = useBackgroundColor();
  const [removeBackground] = useRemoveBackground();
  const [transparency] = useTransparency();
  const automationName = useAtomValue(faceCropName);
  const [selectedSizes] = useSelectedSize();
  const [customBackgroundPaths] = useCustomBackgroundPaths();

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
      const config: EditCustomFaceCropConfig = {
        automation: {
          id: automationId,
          name: automationName,
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
            enable_body_parts_detection: bodyPartDetection as boolean
          },
          background_configuration: {
            schema: 1,
            remove_background: removeBackground,
            background_color: hexColor,
            transparency: transparency,
            step: 2,
            custom_background_image_paths: customBackgroundPaths,
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
    automationId,
    automationName,
    cropMarker,
    cropType,
    cropArea,
    cropSide,
    bodyPartDetection,
    removeBackground,
    hexColor,
    transparency,
    customBackgroundPaths,
    mediaConversionOptions
  ]);
};

export const useCustomFaceCropJobStartConfig = (automationId: string) => {
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

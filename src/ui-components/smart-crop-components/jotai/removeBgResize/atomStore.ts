import { atom, useAtom } from "jotai";
import { atomWithReset, useResetAtom } from "jotai/utils";
import {
  useBackgroundColor,
  useRemoveBackground,
  useSelectedSize,
  useTransparency,
  useCustomBackgroundPaths
} from "..";
import { useMemo } from "react";
import {
  createRemoveBgResizeConfig,
  CropConfigNames,
  EditRemoveBgResizeConfig,
  JobStartConfiguration,
  SMART_CROP_TYPE
} from "../atomTypes";
import { useUpdateAutomationId } from "../atomQueries";

export const removeBgResizeAutomationName = atomWithReset<string>("");
const updateRemoveBgResizeAutomationName = atom(
  get => get(removeBgResizeAutomationName),
  (_get, set, newName: string) => set(removeBgResizeAutomationName, newName)
);
export const useRemoveBgResizeAutomationName = () => useAtom(updateRemoveBgResizeAutomationName);
export const useResetRemoveBgResizeAutomationName = () => useResetAtom(removeBgResizeAutomationName);

export const useRemoveBgResizeJobStartConfig = (automationId: string) => {
  const [selectedSizes] = useSelectedSize();
  const [transparency] = useTransparency();
  const [hexColor] = useBackgroundColor();
  // const [automationId] = useUpdateAutomationId();
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

// new removeBgResizeConfig
export const useNewRemoveBgResizeConfig = () => {
  const [hexColor] = useBackgroundColor();
  const [removeBackground] = useRemoveBackground();
  const [transparency] = useTransparency();
  const [automationId] = useUpdateAutomationId();
  const [customBackgroundPaths] = useCustomBackgroundPaths();

  return useMemo(() => {
    const config: createRemoveBgResizeConfig = {
      automation: {
        name: "Untitled Resize and Remove Background Crop",
        type: SMART_CROP_TYPE.REMOVE_BG_RESIZE
      },
      remove_bg_resize_configuration: {
        background_configuration: {
          schema: 1,
          remove_background: removeBackground,
          background_color: hexColor,
          transparency: transparency,
          step: 1,
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
          step: 2,
          type: "DOWNLOAD"
        }
      }
    };
    return {
      automationId,
      config
    };
  }, [removeBackground, hexColor, transparency, customBackgroundPaths, automationId]);
};

export const useEditedRemoveBgResizeConfig = (automationId: string): EditRemoveBgResizeConfig | undefined => {
  const [hexColor] = useBackgroundColor();
  const [removeBackground] = useRemoveBackground();
  const [transparency] = useTransparency();
  const [automationName] = useRemoveBgResizeAutomationName();
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
    if (automationName && automationId) {
      const config: EditRemoveBgResizeConfig = {
        automation: {
          id: automationId,
          name: automationName,
          type: SMART_CROP_TYPE.REMOVE_BG_RESIZE,
          status: "CONFIGURED"
        },
        remove_bg_resize_configuration: {
          background_configuration: {
            schema: 1,
            remove_background: removeBackground,
            background_color: hexColor,
            transparency: transparency,
            step: 1,
            custom_background_image_paths: customBackgroundPaths,
            type: "BG"
          },
          download_configuration: {
            schema: 1,
            media_conversion_options: mediaConversionOptions,
            step: 2,
            type: "DOWNLOAD"
          }
        }
      };
      return config;
    }
    return undefined;
  }, [
    automationName,
    automationId,
    removeBackground,
    hexColor,
    transparency,
    customBackgroundPaths,
    mediaConversionOptions
  ]);
};

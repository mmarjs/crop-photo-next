import { useQuery } from "@tanstack/react-query";
import { isEmpty } from "lodash";
import { useRouter } from "next/router";
import {
  useBackgroundColor,
  useImageViewerParameter,
  useRemoveBackground,
  useSelectedSize,
  useTransparency,
  useUpdateLatestJobId,
  useCustomBackgroundPaths
} from "..";
import API from "../../../../util/web/api";
import { BackgroundConfiguration, CropConfigNames } from "../atomTypes";
import { useRemoveBgResizeAutomationName } from "./atomStore";

export const useGetRemoveBgSizeConfig = (enabled: boolean, automationId: string) => {
  const router = useRouter();
  const { automationId: currentAutomationId, step, editing } = router?.query;
  const [, setAutomationName] = useRemoveBgResizeAutomationName();
  const [, setHexColor] = useBackgroundColor();
  const [, setRemoveBackground] = useRemoveBackground();
  const [, setTransparency] = useTransparency();
  const [, setSelectedSize] = useSelectedSize();
  const [, updateJobId] = useUpdateLatestJobId();
  const [, setParameter] = useImageViewerParameter();
  const [, setCustomBackgroundPaths] = useCustomBackgroundPaths();

  return useQuery(
    ["useRemoveBgResizeCropConfig", automationId as string],
    async () => {
      const automationResponse = await API.getAutomation(automationId as string, { jobIds: true, config: true });
      if (automationResponse.isPresent()) {
        const config = automationResponse?.get();
        const automation = config.getAutomation();
        const removebgResizeConfig = config.getRemoveBgResizeCropConfigDetails();

        if (!!removebgResizeConfig) {
          setRemoveBackground(removebgResizeConfig?.background_configuration.remove_background as boolean);

          let backgroundConfiguration: BackgroundConfiguration = removebgResizeConfig.background_configuration;
          const transparency = Number(backgroundConfiguration.transparency);
          const hexColor = backgroundConfiguration.background_color;
          const customBackgroundImagePaths = backgroundConfiguration.custom_background_image_paths;

          if (editing === "true") {
            if (transparency === 1) {
              setParameter("transparent");
            }
            if (isEmpty(customBackgroundImagePaths)) {
              if ((transparency === 0 && hexColor === "#FFF") || hexColor === "#FFFFFF") {
                setParameter("white");
              }
              if (transparency === 0 && hexColor !== "#FFF" && hexColor !== "#FFFFFF") {
                setParameter("solid-color");
              }
            }
            if (transparency === 0 && !isEmpty(customBackgroundImagePaths)) {
              setParameter("bg-image");
            }

            setHexColor(hexColor ? hexColor : "");
            setTransparency(transparency);
            setCustomBackgroundPaths(customBackgroundImagePaths as string[]);
          }

          if (!editing || editing !== "true") {
            setParameter("white");
          }

          const sizes = removebgResizeConfig?.download_configuration?.media_conversion_options;
          const selectedSizes =
            !!sizes && sizes?.length > 0
              ? sizes
                  ?.map(option => {
                    if (option?.crop_config_name === CropConfigNames.ORIGINAL) {
                      return "Original";
                    }
                    if (option?.crop_config_name === CropConfigNames.CUSTOM_NAME) {
                      return `${option?.media_size?.width}x${option?.media_size?.height}`;
                    }
                    return undefined;
                  })
                  .filter(Boolean)
              : [];
          setSelectedSize(selectedSizes as string[]);
        }

        const latestJobId = config.getLatestJobId();
        if (!!latestJobId) {
          updateJobId(latestJobId);
          router?.push(
            `${router.pathname}?automationId=${currentAutomationId}&editing=${Boolean(
              editing
            )}&step=${step}&status=${config.getAutomationStatus()}&jobId=${latestJobId}`
          );
        }

        if (!!automation) {
          setAutomationName(automation?.getName() as string);
        }
        return automation;
      }
      return {};
    },
    {
      enabled: enabled && !!automationId
    }
  );
};

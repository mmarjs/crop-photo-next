import { useQuery } from "@tanstack/react-query";
import { isEmpty } from "lodash";
import { useRouter } from "next/router";
import {
  useBackgroundColor,
  useBodyPartDetection,
  useCropArea,
  useCropMarker,
  useImageViewerParameter,
  useRemoveBackground,
  useSelectedSize,
  useTransparency,
  useUpdateLatestJobId,
  useCustomBackgroundPaths
} from "..";
import API from "../../../../util/web/api";
import { CropConfigNames, CropSideValues } from "../atomTypes";
import { useCropSideAtom, useGetandSetFaceCropName } from "./atomStore";

export const useGetFaceCropConfig = (enabled: boolean, automationId: string) => {
  const router = useRouter();
  const { automationId: currentAutomationId, step, editing } = router?.query;
  const [, setAutomationName] = useGetandSetFaceCropName();
  const [, setCropMarker] = useCropMarker();
  const [, setBodyPartDetection] = useBodyPartDetection();
  const [, setCropArea] = useCropArea();
  const [, setHexColor] = useBackgroundColor();
  const [, setRemoveBackground] = useRemoveBackground();
  const [, setTransparency] = useTransparency();
  const [, setSelectedSize] = useSelectedSize();
  const [, updateJobId] = useUpdateLatestJobId();
  const [, setCropSide] = useCropSideAtom();
  const [, setParameter] = useImageViewerParameter();
  const [, setCustomBgPath] = useCustomBackgroundPaths();

  return useQuery(
    ["useGetFaceCropConfig", automationId as string],
    async () => {
      const automationResponse = await API.getAutomation(automationId as string, { jobIds: true, config: true });

      if (automationResponse.isPresent()) {
        const config = automationResponse?.get();
        const automation = config.getAutomation();
        const faceCropConfig = config.getFaceCropConfigDetails();

        if (!!faceCropConfig) {
          setCropMarker(faceCropConfig?.crop_configuration.marker as string);
          setBodyPartDetection(faceCropConfig?.crop_configuration.enable_body_parts_detection as boolean);
          setCropArea(faceCropConfig?.crop_configuration.crop_from_config.crop_side_values as CropSideValues);
          setHexColor(faceCropConfig?.background_configuration.background_color as string);
          setRemoveBackground(faceCropConfig?.background_configuration.remove_background as boolean);

          setCropSide(faceCropConfig?.crop_configuration.crop_from_config.crop_side);

          let backgroundConfiguration = faceCropConfig.background_configuration;
          const transparency = Number(backgroundConfiguration.transparency);
          const hexColor = backgroundConfiguration.background_color;
          const customBackgroundImagePaths = backgroundConfiguration.custom_background_image_paths;

          if (editing === "true") {
            if (transparency === 1) {
              setParameter("transparent");
            } else if (isEmpty(customBackgroundImagePaths)) {
              if ((transparency === 0 && hexColor === "#FFF") || hexColor === "#FFFFFF") {
                setParameter("white");
              }
              if (transparency === 0 && hexColor !== "#FFF" && hexColor !== "#FFFFFF") {
                setParameter("solid-color");
              }
            } else if (transparency === 0 && !isEmpty(customBackgroundImagePaths)) {
              setParameter("bg-image");
            }

            setTransparency(transparency);
            setHexColor(hexColor ? hexColor : "");
            setCustomBgPath(customBackgroundImagePaths as string[]);
          }

          if (!editing || editing !== "true") {
            setParameter("white");
          }

          const sizes = faceCropConfig?.download_configuration?.media_conversion_options;
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
      return [];
    },
    {
      enabled: enabled && !!automationId
    }
  );
};

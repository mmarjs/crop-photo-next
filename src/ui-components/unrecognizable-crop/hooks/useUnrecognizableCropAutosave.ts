import { useMutation } from "@tanstack/react-query";
import { isUndefined } from "lodash";
import { useEffect } from "react";
import useDebounce from "../../../hooks/useDebounce";
import API from "../../../util/web/api";
import { useEditedUnrecognizableCropConfig } from "../../smart-crop-components/jotai/unrecognizableCrop/atomStore";

export default function useUnrecognizableCropAutosave(automationId: string | undefined) {
  const { mutate: updateConfig, isLoading } = useMutation(API.editUnrecognizableCrop, {
    onError: (error: any) => {
      console.error("useAutosave error", error);
    }
  });
  const config = useEditedUnrecognizableCropConfig(automationId as string);
  const debouncedConfig = useDebounce(config, 1000);

  useEffect(() => {
    if (!isUndefined(debouncedConfig)) {
      updateConfig(debouncedConfig);
    }
  }, [debouncedConfig]);

  return { isSavingProgress: isLoading };
}

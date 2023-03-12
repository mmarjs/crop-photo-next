import { useMutation } from "@tanstack/react-query";
import { isUndefined } from "lodash";
import { useEffect } from "react";
import useDebounce from "../../hooks/useDebounce";
import API from "../../util/web/api";
import { useEditedRemoveBgResizeConfig } from "../smart-crop-components/jotai/removeBgResize/atomStore";

export default function useRemoveBgResizeAutosave(automationId: string | undefined) {
  const { mutate: updateConfig, isLoading } = useMutation(API.editRemoveBgResize, {
    onError: (error: any) => {
      console.error("useRemoveBgResizeAutosave error", error);
    }
  });
  const config = useEditedRemoveBgResizeConfig(automationId as string);
  const debouncedConfig = useDebounce(config, 1000);

  useEffect(() => {
    if (!isUndefined(debouncedConfig)) {
      updateConfig(debouncedConfig);
    }
  }, [debouncedConfig]);

  return { isSavingProgress: isLoading };
}

import { atom, useAtom } from "jotai";
import { atomWithQuery } from "jotai/query";
import { atomWithReset, loadable, useResetAtom } from "jotai/utils";
import {
  cropMarkerSize,
  latestCustomSize,
  SampleCropImage,
  selectedSampleCropImage,
  sizeConfig,
  useCropMarker,
  useResetBackgroundParameter,
  useResetBgConfig,
  // useResetCustomBackgroundS3Paths,
  useResetImageIds,
  useResetImageViewerParameter,
  useResetLatestJobId,
  useResetSelectedSizes
} from ".";
import API from "../../../util/web/api";
import SmartCropAssets, { Asset } from "../../components/smart-crop-config/modal/SmartCropAssets";
import { useEffect, useMemo } from "react";
import { LabelValue } from "../../../common/Types";
import { exists } from "i18next";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { AutomationType } from "../../enums/AutomationType";
import { useResetUnrecognizableCropAutomationName } from "./unrecognizableCrop/atomStore";
import { useResetRemoveBgResizeAutomationName } from "./removeBgResize/atomStore";
import { useResetCropSideAtom, useResetCropTypeAtom, useResetFaceCropAutomationName } from "./customFaceCrop/atomStore";

export enum AtomQueryStatus {
  LOADING = "loading",
  HAS_DATA = "hasData",
  HAS_ERROR = "hasError"
}

export type AssetDetailsData = {
  n_entries: number;
  entries: Asset[];
};
const automationTypeAtom = atom<AutomationType | undefined>(undefined);
const setAutomationTypeAtom = atom(
  get => {
    return get(automationTypeAtom);
  },
  (get, set, newValue: AutomationType) => {
    set(automationTypeAtom, newValue);
  }
);

export const useAutomationType = () => {
  return useAtom(setAutomationTypeAtom);
};

export const useOnReloadAutomationType = (type: AutomationType) => {
  const [automationType, setAutomationType] = useAtom(setAutomationTypeAtom);
  useEffect(() => {
    if (!!type && !automationType) {
      setAutomationType(type);
    }
  }, [type, automationType, setAutomationType]);
};

const assetDetailsAtom = loadable(
  atomWithQuery(get => ({
    queryKey: ["getAssetDetails", get(automationTypeAtom)],
    queryFn: async ({ queryKey: [, id] }) => {
      const { data } = await API.getAssetDetails(id as AutomationType);
      return data as AssetDetailsData;
    },
    enabled: !!get(automationTypeAtom)
  }))
);

const sampleImagesAtom = atom(get => {
  const assets = get(assetDetailsAtom);
  const entries = assets.state === AtomQueryStatus.HAS_DATA ? assets?.data?.entries : [];
  return { entries, isLoading: AtomQueryStatus.LOADING };
});

export function useAssetDetails() {
  return useAtom(assetDetailsAtom);
}

export function useSmartCropAssets(): [SmartCropAssets | undefined, string] {
  const [assets] = useAtom(assetDetailsAtom);
  const assetsData = assets?.state === AtomQueryStatus.HAS_DATA ? assets.data : undefined;
  return useMemo(() => {
    if (assetsData) {
      const smartCropAssets = new SmartCropAssets(assetsData?.entries);
      return [smartCropAssets, assets.state];
    }
    return [undefined, AtomQueryStatus.HAS_ERROR];
  }, [assetsData, assets.state]);
}

export function useMarkerOptions(): [LabelValue[], string] {
  const { t } = useTranslation();
  const [smartCropAssets, state] = useSmartCropAssets();
  return useMemo(() => {
    if (smartCropAssets) {
      const assetIds = smartCropAssets.getAllAssetsId();
      const defaultId = assetIds[0];
      const markerOptions: LabelValue[] = smartCropAssets.getAllMarkerOptionsById(defaultId).map(marker => {
        let labelKey = `configuration.left_panel.select_a_marker_dropdown.${marker}`;
        let label = exists(labelKey) ? t(labelKey) : marker;
        return {
          label: label,
          value: marker
        };
      });
      return [markerOptions, state];
    }
    return [[], AtomQueryStatus.HAS_ERROR];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [smartCropAssets, state]);
}

const automationId = atomWithReset<string | undefined>(undefined);
const updateAutomationId = atom(
  get => get(automationId),
  (get, set, newAutomationId: string) => set(automationId, newAutomationId)
);
const useResetAutomationId = () => useResetAtom(automationId);
loadable(
  atomWithQuery(get => ({
    queryKey: ["cropAutomationConfig", get(automationId)],
    queryFn: async ({ queryKey: [, id] }) => {
      if (id) {
        return await API.getAutomation(id as string, { jobIds: true, config: true });
      }
      return {};
    },
    enabled: !!get(automationId)
  }))
);
export const useUpdateAutomationId = () => {
  return useAtom(updateAutomationId);
};

export const useResetCropConfig = () => {
  const resetUnrecogAutomationName = useResetUnrecognizableCropAutomationName();
  const resetRemoveBgResizeAutomationName = useResetRemoveBgResizeAutomationName();
  const resetCustomFaceCropAutomationName = useResetFaceCropAutomationName();
  const resetBgConfig = useResetBgConfig();
  const resetAutomationId = useResetAutomationId();
  const [, setCropMarker] = useCropMarker();
  const resetCropMarkerSize = useResetAtom(cropMarkerSize);
  const resetSizeConfig = useResetAtom(sizeConfig);
  const resetSelectedImage = useResetAtom(selectedSampleCropImage);
  const resetSelectedSizes = useResetSelectedSizes();
  const resetLatestCustomSize = useResetAtom(latestCustomSize);
  const resetImageIds = useResetImageIds();
  const resetLatestJobId = useResetLatestJobId();
  const resetCropType = useResetCropTypeAtom();
  const resetCropSide = useResetCropSideAtom();
  // const resetSelectedCustomBg = useResetCustomBackgroundS3Paths();
  // const resetS3Path = useResetCustomBackgroundS3Paths();
  const resetViewParameter = useResetImageViewerParameter();
  const resetBackgroundParameter = useResetBackgroundParameter();

  const reset = () => {
    // resetS3Path();
    // resetSelectedCustomBg();
    resetViewParameter();
    resetBackgroundParameter();
    resetUnrecogAutomationName();
    resetRemoveBgResizeAutomationName();
    resetCustomFaceCropAutomationName();
    resetBgConfig();
    resetAutomationId();
    setCropMarker("BETWEEN_EYES_AND_NOSE");
    resetCropMarkerSize();
    resetSizeConfig();
    resetSelectedImage();
    resetSelectedSizes();
    resetLatestCustomSize();
    resetImageIds();
    resetCropType();
    resetLatestJobId;
    resetCropSide();
  };
  return reset;
};

export function useSampleImages() {
  return useAtom(sampleImagesAtom);
}

//selected sample image atoms
const selectedSampleImage = atomWithReset<SampleCropImage | undefined>(undefined);
const getSelectedSampleImage = atom(get => get(selectedSampleImage));
const getSampleImageIndex = atom(get => {
  const { entries } = get(sampleImagesAtom);
  if (!!entries) {
    const selectedImage = get(selectedSampleImage);
    const index = entries?.findIndex(entry => entry.id === selectedImage?.id);
    const nextIndex = index + 1;
    const prevIndex = index - 1;
    return [index, nextIndex, prevIndex];
  }
  return [undefined, undefined, undefined];
});

export const useResetSampleImage = () => {
  return useResetAtom(selectedSampleImage);
};

const getHasNextImage = atom(get => {
  const { entries } = get(sampleImagesAtom);
  if (!!entries) {
    const selectedImage = get(selectedSampleImage);
    const index = entries?.findIndex(entry => entry.id === selectedImage?.id);
    const nextIndex = index + 1;
    return nextIndex !== entries.length;
  }
  return undefined;
});

const getHasPrevImage = atom(get => {
  const { entries } = get(sampleImagesAtom);
  if (!!entries) {
    const selectedImage = get(selectedSampleImage);
    const index = entries.findIndex(entry => entry.id === selectedImage?.id);
    const prevIndex = index - 1;
    return prevIndex !== -1;
  }
  return undefined;
});

const updateSelectedSampleImage = atom(
  get => get(selectedSampleImage),
  (_get, set, sampleImage: SampleCropImage) => {
    set(selectedSampleImage, sampleImage);
  }
);

export function useGetSelectedSampleImage() {
  return useAtom(getSelectedSampleImage);
}

export function useUpdateSelectedSampleImage() {
  return useAtom(updateSelectedSampleImage);
}

export function useGetSampleImageIndexes() {
  return useAtom(getSampleImageIndex);
}

export function useGetHasNextImage() {
  const [hasNext] = useAtom(getHasNextImage);
  return hasNext;
}

export function useGetHasPrevImage() {
  const [hasPrev] = useAtom(getHasPrevImage);
  return hasPrev;
}

export function useGetUploadedAssetCount(automationId: string) {
  return useQuery(["useGetUploadedAssetCount", automationId], async () => {
    const { data } = await API.getAssetsForAutomations(automationId as string, 0, 10);
    return data;
  });
}

export function useGetAutomationStatus(automationId: string) {
  return useQuery(
    ["useGetAutomationStatus", automationId],
    async () => {
      const automationResponse = await API.getAutomation(automationId as string);
      return automationResponse.get();
    },
    {
      enabled: !!automationId
    }
  );
}

export function useGetAutomationLatestJobId(automationId: string | undefined) {
  return useQuery(
    ["useGetAutomationLatestJobId", automationId],
    async () => {
      const response = await API.getAutomation(automationId as string);
      if (response.isPresent()) {
        const automationResponse = response.get();
        // updateJobId(latestJobId);
        return automationResponse.getLatestJobId();
      }
      return "";
    },
    {
      enabled: !!automationId
    }
  );
}

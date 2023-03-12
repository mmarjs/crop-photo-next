import classNames from "classnames";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Photo } from "../../../common/Types";
import { CROP_TYPE } from "../../components/smart-crop-config/smart-crop-config-constants";
import { SmartCropSummary } from "../../components/smartcrop-summary";
import {
  useCropArea,
  useCropAreaAround,
  useCropMarker,
  useIsOnLargePreview,
  useUpdateCropInfo,
  useUpdateLatestJobId,
  useUploadedMedia
} from "../jotai";
import { useCropSideAtom, useCropTypeAtom } from "../jotai/customFaceCrop/atomStore";
import UploadPanel from "../UploadPanel";
import ImageViewer from "./ImageViewer";
import RightEditPanel from "../RightEditPanel";
import styles from "./RightPanel.module.scss";

interface RightPanelProps {
  showImageViewer: boolean;
  showUploadPanel: boolean;
  showSummary: boolean;
  showEditPanel: boolean;
  automationName: string;
}

const RightPanel = ({
  showImageViewer,
  showSummary,
  showUploadPanel,
  showEditPanel,
  automationName
}: RightPanelProps) => {
  const [isSliding] = useState<boolean>(false);
  const [selectedMarkerIndex, setSelectedMarkerIndex] = useState<number>(0);
  const [cropMarker] = useCropMarker();
  const [, setCropInfo] = useUpdateCropInfo();
  const [cropArea] = useCropArea();
  const [cropAreaAround] = useCropAreaAround();
  // const [cropAreaFrom] = useCropArea();
  const router = useRouter();
  const { automationId } = router?.query;
  const [isOnLargePreview] = useIsOnLargePreview();
  const [, updateJobId] = useUpdateLatestJobId();
  const [, updateUploadedMedia] = useUploadedMedia();
  const [cropSide] = useCropSideAtom();
  const [cropType] = useCropTypeAtom();

  const automationType = router?.pathname;

  useEffect(() => {
    if (showImageViewer) {
      if (automationType === "/custom-face-crop") {
        setCropInfo({
          cropType: cropType,
          cropSize: cropType === "CROP_AROUND" ? cropAreaAround : cropArea,
          cropMarker,
          cropPosition: undefined,
          cropSide: cropSide ?? "BOTTOM",
          removeBackground: false,
          isIncludeBoundingBox: false
        });
      } else
        setCropInfo({
          cropType: CROP_TYPE.CROP_FROM,
          cropSize: cropArea,
          cropMarker,
          cropPosition: undefined,
          cropSide: cropSide ?? "BOTTOM",
          removeBackground: false,
          isIncludeBoundingBox: false
        });
    }
  }, [cropSide, cropMarker, cropArea, cropAreaAround, showImageViewer, setCropInfo, cropType, automationType]);

  const onUploadedSuccess = useCallback(
    (images: Photo[]) => {
      updateUploadedMedia(images);
    },
    [updateUploadedMedia]
  );

  return (
    <div
      className={classNames(styles.rightPanelWrapper, {
        [styles.noLeftPanel]: isOnLargePreview
      })}
    >
      {showImageViewer ? (
        <ImageViewer
          isSliding={isSliding}
          setSelectedMarkerIndex={(index: number) => setSelectedMarkerIndex(index)}
          selectedMarkerIndex={selectedMarkerIndex}
        />
      ) : null}
      {showUploadPanel ? (
        <UploadPanel
          automationId={automationId as string}
          onConfigSave={() => {}}
          onUploadSuccess={onUploadedSuccess}
          updateJobId={updateJobId}
          leftPanelActive={true}
        />
      ) : null}
      {showSummary ? (
        <SmartCropSummary
          leftPanelActive={true}
          automationId={automationId as string}
          automationName={automationName}
          hideInProgressBreadcrumbs
        />
      ) : null}
      {showEditPanel ? <RightEditPanel isSliding={false} /> : null}
    </div>
  );
};

export default RightPanel;

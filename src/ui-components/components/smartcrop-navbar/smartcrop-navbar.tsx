import { useState } from "react";
import { useCroppedImages } from "../../smart-crop-components/jotai";
import { useRouter } from "next/router";
import { AUTOMATION_STATUS } from "../../../common/Enums";
import {
  useEditImage,
  useIsOnLargePreview,
  useIsOpenEditPanel,
  useLargePreviewData,
  useUpdateLatestJobId
} from "../../smart-crop-components/jotai";
import styles from "./smartcrop-navbar.module.scss";
import { IconBrush, IconLeftAngle } from "../../assets";
import { Button } from "../button";
import { DownloadImageToken } from "../../../models/DownloadImageResponse";
import { CloudDownloadOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import API from "../../../util/web/api";
import { SmartCropEditUrls } from "../../../common/Types";
import MediaSize from "../../../models/MediaSize";

interface SmartCropNavbarProps {
  hideInProgressBreadcrumbs?: boolean;
  onDownload: (downloadToken: DownloadImageToken) => void;
}

const SmartCropNavbar = ({ hideInProgressBreadcrumbs, onDownload }: SmartCropNavbarProps) => {
  const [, setIsOnLargePreview] = useIsOnLargePreview();
  const [largePreview, updateLargePreview] = useLargePreviewData();
  const [, setIsOpenEditPanel] = useIsOpenEditPanel();
  const [, updateEditImage] = useEditImage();
  const [croppedImages] = useCroppedImages();
  const [latestJobId] = useUpdateLatestJobId();

  const router = useRouter();
  const { status } = router?.query;
  const pathArray = [
    ["Configurations", ""],
    ["Select Media", ""],
    ["Smart Crop", "/custom-face-crop"]
  ];

  const handleClose = () => {
    if (largePreview) {
      setIsOnLargePreview(false);
      updateLargePreview(undefined);
    } else {
      router.push("/");
    }
  };

  const handleEdit = async () => {
    if (largePreview) {
      const editUrls = await API.getSmartCropEditUrls(latestJobId, largePreview.id);
      if (editUrls) {
        const editdata: SmartCropEditUrls = {
          cropId: largePreview.id,
          imgName: largePreview.name,
          dimension: croppedImages.find(image => image.id === largePreview.id)?.dimension as MediaSize,
          originalFileName: editUrls.data.original_file_name,
          originImgUrl: editUrls.data.output_with_bg_signed_url,
          outputWithBgKey: editUrls.data.output_with_bg_key,
          customBgUrl: editUrls.data.original_custom_bkg_signed_url,
          customBgKey: editUrls.data.custom_bg_key,
          transparentImgUrl: editUrls.data.input_bg_removed_signed_url,
          inputWithBgKey: editUrls.data.input_bg_removed_key,
          editUploadPath: editUrls.data.edit_upload_path,
          croppedSignedUrl: editUrls.data.cropped_output_signed_url
        };
        router.push(router?.asPath);
        setIsOpenEditPanel(true);
        updateEditImage(editdata);
        setIsOnLargePreview(false);
        updateLargePreview(undefined);
      }
    }
  };

  const handleDownloadImage = () => {
    if (largePreview) {
      const downloadToken = new DownloadImageToken();
      const image = croppedImages.find(image => image.id === largePreview.id);
      if (image) {
        downloadToken.automation_id = router?.query?.automationId as string;
        downloadToken.crop_ids = [image.id];
        onDownload(downloadToken);
      }
    }
  };

  return (
    <div className={styles.Wrapper}>
      {largePreview ? (
        <EditImagePreview
          name={largePreview.name}
          onEdit={handleEdit}
          onClose={handleClose}
          onDownload={handleDownloadImage}
        />
      ) : null}
      {status === AUTOMATION_STATUS.COMPLETED && !largePreview ? <h1 className={styles.Title}>Summary</h1> : null}
    </div>
  );
};

interface EditImagePreviewProps {
  name: string;
  onEdit: () => void;
  onClose: () => void;
  onDownload: () => void;
}

function EditImagePreview({ name, onEdit, onClose, onDownload }: EditImagePreviewProps) {
  return (
    <div className={styles.LargePreviewNavbar}>
      <div className={styles.NavLeftContainer} onClick={onClose}>
        <Button type="text" icon={<IconLeftAngle />} onClick={onClose} />
        <p className={styles.Title}>{name}</p>
      </div>
      <div className={styles.ActionIcons}>
        <ActionIcon onClick={onEdit} className={styles.BrushIcon} tooltip="Edit">
          {({ isHovered }: { isHovered: boolean }) => (
            <IconBrush style={{ color: isHovered ? "#1338ff" : "#061426" }} />
          )}
        </ActionIcon>
        <ActionIcon onClick={onDownload} className={styles.DownloadIcon} tooltip="Download">
          {({ isHovered }: { isHovered: boolean }) => (
            <CloudDownloadOutlined
              style={{ color: isHovered ? "#1338ff" : "#061426", cursor: "pointer", fontSize: 24 }}
            />
          )}
        </ActionIcon>
      </div>
      <div />
    </div>
  );
}

interface ActionIconProps {
  children: any;
  onClick: () => void;
  className: string;
  tooltip: string;
}

const ActionIcon = ({ children, onClick, className, tooltip }: ActionIconProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Tooltip title={tooltip}>
      <span
        onClick={onClick}
        className={className}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children({ isHovered })}
      </span>
    </Tooltip>
  );
};

export default SmartCropNavbar;

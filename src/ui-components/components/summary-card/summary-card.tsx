/* eslint-disable @next/next/no-img-element */
import { FC, useState } from "react";
import { Skeleton, Spin } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import classNames from "classnames";
import { Photo } from "../../../common/Types";
import { Button } from "../button";
import { Checkbox } from "../checkbox";
import styles from "./summary-card.module.scss";
import { IconThreeDots } from "../../assets";
import { Dropdown } from "../dropdown";
import { ConversionUtil } from "../../utils";
import { useTranslation } from "react-i18next";
import IconWarning from "../../assets/icons/icon-warning.svg";
import IconError from "../../assets/icons/close-icon.svg";
import { Tooltip } from "../tooltip";
import { FacebookBlack, InstagramBlack, LinkedInBlack, PinterestBlack, TwitterBlack } from "../../assets";
import { CropConfigName } from "../../smart-crop/select-format/select-format-utils";
import MediaSize from "../../../models/MediaSize";
import { DownloadImageToken } from "../../../models/DownloadImageResponse";
import { useRouter } from "next/router";
import { LoadingOutlined } from "@ant-design/icons";
import {
  useIsOnLargePreview,
  useLargePreviewData,
  useIsOpenEditPanel,
  useEditImage,
  useUpdateLatestJobId
} from "../../smart-crop-components/jotai";
import API from "../../../util/web/api";
import { SmartCropEditUrls } from "../../../common/Types";
interface MediaCardProps {
  image: Photo;
  isSelected: boolean;
  onSelect: (e: CheckboxChangeEvent, croppedId: string) => void;
  onDelete?: Function;
  onDownload: Function;
  onEdit?: Function;
}

const SummaryCard: FC<MediaCardProps> = ({ image, isSelected, onSelect, onDownload, onEdit }) => {
  const [isHover, setIsHover] = useState<boolean>(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { t } = useTranslation();
  const router = useRouter();
  const [, setIsOnLargePreview] = useIsOnLargePreview();
  const [, setIsOpenEditPanel] = useIsOpenEditPanel();
  const [, updateLargePreview] = useLargePreviewData();
  const [, updateEditImage] = useEditImage();
  const [latestJobId] = useUpdateLatestJobId();

  const downloadImage = (imageId: string) => () => {
    const downloadToken = new DownloadImageToken();
    downloadToken.automation_id = router?.query?.automationId as string;
    downloadToken.crop_ids = [imageId];
    onDownload && onDownload(downloadToken);
  };

  const handleImageViewClick = () => {
    if (image?.imageUrl && image?.id) {
      router.push(router?.asPath);
      setIsOnLargePreview(true);
      updateLargePreview({
        id: image.id,
        name: image?.name,
        url: image.imageUrl
      });
    }
  };

  const handleImageEditClick = async (e: any) => {
    const editUrls = await API.getSmartCropEditUrls(latestJobId, image.id);
    if (editUrls) {
      const editdata: SmartCropEditUrls = {
        cropId: image.id,
        imgName: image.name,
        dimension: image.dimension as MediaSize,
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

      updateEditImage(editdata);
      router.push(router?.asPath);
      setIsOpenEditPanel(true);
    }
  };

  const menu = [
    {
      id: "download",
      label: "Download",
      onClick: downloadImage(image?.id as string)
    },
    {
      id: "edit",
      label: "Edit",
      onClick: handleImageEditClick
    }
  ];

  return (
    <div
      className={classNames(styles.SummaryCardWrapper, {
        [styles.Selected]: isSelected || isHover
      })}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <div className={styles.ImageView} onClick={handleImageViewClick}>
        {!isImageLoaded ? (
          <div className={styles.projectSkeleton}>
            <Spin
              className={styles.Spinner}
              indicator={<LoadingOutlined style={{ fontSize: 50, color: "#0038FF" }} spin />}
            />
            <span className={styles.Progress} />
          </div>
        ) : null}
        {image?.thumbnailUrl ? (
          <>
            <img
              src={`${image?.thumbnailUrl}`}
              loading="lazy"
              alt={""}
              onLoad={() => setIsImageLoaded(true)}
              onLoadStart={() => setIsImageLoaded(false)}
              style={{
                backgroundImage: isImageLoaded
                  ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(135deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(135deg, transparent 75%, #ccc 75%)"
                  : "none"
              }}
            />
            {isSelected || isHover ? <div className={styles.Mask} /> : null}
          </>
        ) : null}
      </div>
      <div className={styles.ContentView}>
        <div className={styles.Section}>
          {image.errorCode ? (
            <span className={styles.ImageWarning}>
              <Tooltip title={t(image.errorCode)} placement="top">
                <IconError
                  fill="white"
                  width="14.67px"
                  height="12.67px"
                  style={{
                    background: "red",
                    borderRadius: "50%",
                    padding: "4px",
                    height: "16px",
                    width: "16px",
                    marginTop: "7px"
                  }}
                />
              </Tooltip>
            </span>
          ) : null}
          {image.warnCode ? (
            <span className={styles.ImageWarning}>
              <Tooltip title={t(image.warnCode)} placement="top">
                <IconWarning fill="#FDBE1B" width="14.67px" height="12.67px" />
              </Tooltip>
            </span>
          ) : null}
          <h5 className={styles.ImageName} title={image.name}>
            {image.name}
          </h5>
          {/* {image.errorCode ? null : (
            <Dropdown dropdownItems={menu} placement="bottomRight" triggerOn="click">
              <Button size="sm" type="text" className={styles.ShowMoreDropdown} icon={<IconThreeDots />} />
            </Dropdown>
          )} */}
          <Dropdown dropdownItems={menu} placement="bottomRight" triggerOn="click">
            <Button size="sm" type="text" className={styles.ShowMoreDropdown} icon={<IconThreeDots />} />
          </Dropdown>
        </div>
        <div
          className={classNames(styles.BottomSection, {
            // [styles.Hidden]: image.errorCode
          })}
        >
          {image.id && (
            <>
              <CropConfigNameIcon configName={image.cropConfigName} />
              <p className={styles.BottomInfo}>
                <DimensionText mediaSize={image.dimension} />
                {image?.size ? (
                  <span
                    className={classNames(styles.ImageSize, {
                      [styles.Hidden]: image?.errorCode
                    })}
                    title={ConversionUtil.formatBytes(image.size)}
                  >
                    {ConversionUtil.formatBytes(image.size)}
                  </span>
                ) : null}
              </p>
            </>
          )}
          {!image.id && (
            <>
              <Skeleton title={false} paragraph={{ rows: 2 }} active />
              <Skeleton style={{ alignSelf: "end" }} title={false} paragraph={{ rows: 1 }} active />
            </>
          )}
        </div>
      </div>
      {/* {image.errorCode ? null : (
        <Checkbox
          className={styles.SelectCheckbox}
          onChange={e => onSelect(e, image.id as string)}
          checked={isSelected}
        />
      )} */}
      <Checkbox
        className={styles.SelectCheckbox}
        onChange={e => onSelect(e, image.id as string)}
        checked={isSelected}
      />
    </div>
  );
};

type CropConfigNameIconProps = {
  configName?: CropConfigName;
};

function DimensionText({ mediaSize }: { mediaSize?: MediaSize }) {
  if (!!mediaSize && mediaSize.width && mediaSize.height) {
    return (
      <span className={styles.MediaSize}>
        {mediaSize?.width}x{mediaSize?.height}
      </span>
    );
  }
  return null;
}

function CropConfigNameIcon(props: CropConfigNameIconProps) {
  const configName = props.configName;
  let element: JSX.Element | null = null;
  if (configName) {
    if (configName == CropConfigName.FACEBOOK) {
      element = <FacebookBlack style={{ width: 16, height: 16 }} />;
    } else if (configName == CropConfigName.INSTAGRAM) {
      element = <InstagramBlack style={{ width: 16, height: 16 }} />;
    } else if (configName == CropConfigName.LINKEDIN) {
      element = <LinkedInBlack style={{ width: 16, height: 16 }} />;
    } else if (configName == CropConfigName.TWITTER) {
      element = <TwitterBlack style={{ width: 16, height: 16 }} />;
    } else if (configName == CropConfigName.PINTEREST) {
      element = <PinterestBlack style={{ width: 16, height: 16 }} />;
    }
  }
  if (element) {
    return <>{element}&nbsp;</>;
  }
  return null;
}

export default SummaryCard;

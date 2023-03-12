import { useEffect, useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { Skeleton, Spin } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import classNames from "classnames";
import date from "../../utils/date";
import { UploadingPhoto } from "../../../common/Types";
import { Button } from "../button";
import { Checkbox } from "../checkbox";
import { IconThreeDots } from "../../assets";
import { Dropdown } from "../dropdown";
import { ConversionUtil } from "../../utils";
import { Logger } from "aws-amplify";
import styles from "./media-card.module.scss";

type SummaryCardProps = {
  image: UploadingPhoto;
  selected: boolean;
  onSelect: (e: CheckboxChangeEvent, imageId: string) => void;
  onDelete?: (id: string) => void;
  isUploaded?: boolean;
};
const DEFAULT_IMAGE = "/images/default-fallback-image.png";
const logger = new Logger("ui-components.components.media-card");

const MediaCard = ({ image, selected, onSelect, onDelete }: SummaryCardProps) => {
  const [imageURL, setImageURL] = useState<string>(DEFAULT_IMAGE);
  const [objectFitClass, setObjectFitClass] = useState<string>("fit-cover");
  const [isThumbGenerated, setThumbGeneratedFlag] = useState<boolean>();
  const [isHover, setIsHover] = useState<boolean>(false);

  useEffect(() => {
    if (image?.isThumbGenerated && image?.thumbnailUrl) {
      logger.debug(
        `[Mediacard - useEffect()] id:${image.id} name: ${image.name} asset_id: ${
          image.assetId
        } url: ${image.thumbnailUrl.substring(0, 10)}`
      );
      setObjectFitClass("fit-contain");
      setImageURL(image.thumbnailUrl);
      setThumbGeneratedFlag(true);
    }
    return () => setImageURL(DEFAULT_IMAGE);
  }, [image.assetId, image.id, image?.isThumbGenerated, image.name, image.thumbnailUrl]);

  const deleteImage = (imageName: string) => () => {
    onDelete && onDelete(imageName);
  };

  const menu = [
    {
      id: "delete",
      //Todo: I18n.
      label: "Delete",
      onClick: deleteImage(image.id)
    }
  ];

  const onImageLoad = () => {
    logger.debug(
      `on image load for uiid:${image.id} and assetId: ${image.assetId} and name ${image.name} and thumbgenerated: ${image.isThumbGenerated}`
    );
    logger.debug(
      `[Mediacard onImageLoad()] uiid:${image.id} asset_id: ${image.assetId} name: ${
        image.name
      } src: ${imageURL.substring(0, 10)}`
    );

    if (isThumbGenerated) {
      setImageURL(image?.thumbnailUrl || "");
    }
    setThumbGeneratedFlag(false);
  };

  const imageLoadStarted = () => {
    logger.debug(
      `[Mediacard imageLoadStarted()] uiid:${image.id} asset_id: ${image.assetId} name: ${
        image.name
      } src: ${imageURL.substring(0, 10)}`
    );
  };

  return (
    <div
      className={classNames(styles.Wrapper, { [styles.Selected]: selected || isHover })}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <div className={styles.ImageView}>
        {!image?.isUploading && imageURL && (
          <>
            {image?.isThumbGenerated ? (
              <img className={objectFitClass} src={imageURL} loading="lazy" alt={image.name} onLoad={onImageLoad} />
            ) : (
              <img className={objectFitClass} src={DEFAULT_IMAGE} alt={"default-image"} />
            )}
            {selected || isHover ? <div className={styles.Mask} /> : null}
          </>
        )}
        {image?.isUploading && (
          <>
            <Spin
              className={styles.Spinner}
              indicator={<LoadingOutlined style={{ fontSize: 50, color: "#0038FF" }} spin />}
            />
            {!!image.percent && image.percent > 0 && <span className={styles.Progress}>{image.percent}%</span>}
          </>
        )}
      </div>
      <div className={styles.ContentView}>
        <div className={styles.Section}>
          <h5 className={styles.ImageName} title={image.name}>
            {image.name}
          </h5>
          <Dropdown dropdownItems={menu} placement="bottomRight" triggerOn="click">
            <Button size="sm" type="text" className={styles.ShowMoreDropdown} icon={<IconThreeDots />} />
          </Dropdown>
        </div>
        <div className={styles.Section}>
          {image.assetId && (
            <>
              <span>{date(image.lastModified).format("MMM D, YYYY")}</span>
              <span>{ConversionUtil.formatBytes(image.size)}</span>
            </>
          )}
          {!image.assetId && (
            <>
              <Skeleton title={false} paragraph={{ rows: 1 }} active />
              <Skeleton style={{ alignSelf: "end" }} title={false} paragraph={{ rows: 1 }} active />
            </>
          )}
        </div>
      </div>
      {!image?.isUploading ? (
        <Checkbox className={styles.SelectCheckbox} onChange={e => onSelect(e, image.id)} checked={selected} />
      ) : null}
    </div>
  );
};

export default MediaCard;

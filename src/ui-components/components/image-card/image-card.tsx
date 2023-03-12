import React from "react";
import classNames from "classnames";
import styles from "./image-card.module.scss";
import { AssetData, ComponentProp, Photo } from "../../../common/Types";
import { CropStatus } from "../../enums";
import IconCropped from "../../assets/icons/icon-cropped.svg";

type ImageCardProps = ComponentProp & {
  selectImage: Function;
  image: AssetData & Photo;
  showMarker?: boolean;
  paused: boolean;
};

const ImageCard = ({ className, selectImage, image, paused }: ImageCardProps) => {
  return (
    <div className={classNames(styles.Wrapper, className)} onClick={() => selectImage(image)}>
      <img src={`${image?.thumb_url}#${new Date().getTime()}`} alt={image.name} loading="lazy" />
      <div className={styles.Mask} />
      {image.cropStatus !== CropStatus.NOT_PROCESSED && (
        <div className={styles.Status}>
          {image.cropStatus === CropStatus.PROCESSING && (
            <>
              <div className={styles.OuterCircle}>
                <span
                  className={classNames(styles.PieAnimation, {
                    [styles.PieAnimationPaused]: paused
                  })}
                />
              </div>
            </>
          )}
          {image.cropStatus === CropStatus.PROCESSED && <IconCropped />}
        </div>
      )}
    </div>
  );
};

export default ImageCard;

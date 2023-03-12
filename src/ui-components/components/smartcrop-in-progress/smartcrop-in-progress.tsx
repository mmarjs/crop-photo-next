import React, { useCallback, useEffect, useRef, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { Dispatch } from "redux";
import classNames from "classnames";
import { Image, Slider } from "antd";
import { ImageCard } from "../image-card";
import styles from "./smartcrop-in-progress.module.scss";
import { CropStatus } from "../../enums";
import { SmartCropStructType } from "../../../redux/structs/smartcrop";
import { addCroppedImg, updateTotalAssetCount } from "../../../redux/actions/smartcropActions";
import { Button } from "../button";
import { AssetData, Photo } from "../../../common/Types";
import AngleLeftIcon from "../../assets/icons/icon-angle-left.svg";
import AngleRightIcon from "../../assets/icons/icon-angle-right.svg";
import API from "../../../util/web/api";
import { Logger } from "aws-amplify";
import { useTranslation } from "react-i18next";
import { useIntercom } from "react-use-intercom";

type PropsFromRedux = ConnectedProps<typeof connector>;

interface InProgressProps extends PropsFromRedux {
  automationId: string;
}

const SmartCropInProgress = ({
  stop,
  pause,
  processedCount,
  showMarker,
  addCroppedImage,
  updateTotalCount,
  automationId
}: InProgressProps) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const logger = new Logger("ui-components:components:smartcrop-in-progress");
  const [images, setImages] = useState<Photo[] & AssetData[]>([]);
  const [selectedImage, selectImage] = useState<AssetData & Photo>();
  const [imageSize, setImageSize] = useState(100);
  const [totalAssets, setTotalAssets] = useState<number>(0);
  // const [currentPage, setCurrentPage] = useState(1);
  const galleryEl = useRef<HTMLDivElement>(null);
  const imageViewEl = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const { update: updateIntercom } = useIntercom();

  const total = 100; // Limit for development purpose
  updateTotalCount(total);

  const scrollToRight = () => {
    if (galleryEl.current) {
      galleryEl.current.scrollTo(galleryEl.current.scrollLeft + 112, 0);
    }
  };

  const goToPrevPage = () => {
    if (galleryEl.current) {
      galleryEl.current.scrollTo(galleryEl.current.scrollLeft - galleryEl.current.clientWidth + 12, 0);
    }
  };

  const goToNextPage = () => {
    if (galleryEl.current) {
      galleryEl.current.scrollTo(galleryEl.current.scrollLeft + galleryEl.current.clientWidth - 12, 0);
    }
  };

  const loadPhotos = useCallback(
    (init?: boolean) => {
      if (total === images.length || !init) return;
      logger.info("loadPhotos getAssetsForAutomations");
      API.getAssetsForAutomations(`${automationId}`, 0, total, "").then(response => {
        logger.info("getAssetsForAutomations respoonse", response);
        const newImages =
          response?.data?.entries?.length > 0
            ? response.data.entries.map((photo: any, idx: number) => ({
                ...photo,
                cropStatus: idx === 0 ? CropStatus.PROCESSING : CropStatus.NOT_PROCESSED
              }))
            : [];
        if (response?.data?.entries?.length !== totalAssets) {
          setTotalAssets(response.data.total);
          setImages(oldImages => [...oldImages, ...newImages]);
        }
        updateIntercom({
          verticalPadding: 190,
          hideDefaultLauncher: false
        });
      });
    },
    [automationId, images.length, logger, totalAssets, updateIntercom]
  );

  useEffect(() => {
    loadPhotos(true);
    updateIntercom({
      hideDefaultLauncher: true
    });
    return () => {
      updateIntercom({
        verticalPadding: 30
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let timeout: any;
    logger.info("selecting default image", images);
    if (!stop && !pause && !!images[processedCount]) {
      timeout = setTimeout(() => {
        if (processedCount < images.length) {
          images[processedCount] = {
            ...images[processedCount],
            cropStatus: CropStatus.PROCESSED,
            mask: [100, 100, 200, 200]
          };

          if (processedCount === images.length - 1) {
            loadPhotos();
          } else {
            images[processedCount + 1] = {
              ...images[processedCount + 1],
              cropStatus: CropStatus.PROCESSING
            };
          }

          // if (selectedImage?.id === images[processedCount].id) {}

          selectImage(images[0]);
          // addCroppedImage(images[processedCount]);
        }
      }, 320);
    }
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [stop, pause, processedCount, images, selectedImage, logger, loadPhotos]);

  const onSelectImage = (image: Photo) => {
    const img = image as AssetData & Photo;
    selectImage(img);
  };
  console.log({ selectedImage });
  return (
    <div className={styles.Wrapper}>
      {pause && <div className={styles.Banner}>{t("in_progress.summary.paused_toast_label")}</div>}
      <div
        className={classNames(styles.SelectedImage, {
          [styles.AlignCenter]: imageSize < 100
        })}
        ref={imageViewEl}
      >
        {showMarker && selectedImage?.cropStatus === CropStatus.PROCESSED && <div className={styles.Marker} />}
        {selectedImage && (
          <Image
            src={`${selectedImage.thumb_url}#${new Date().getTime()}`}
            alt={selectedImage.name}
            height={!imageViewEl.current ? "auto" : (imageViewEl.current.clientHeight * imageSize) / 100}
            preview={false}
            placeholder={
              <Image
                preview={false}
                src={selectedImage.preview_url}
                height={!imageViewEl.current ? "auto" : (imageViewEl.current.clientHeight * imageSize) / 100}
                alt="#"
              />
            }
          />
        )}
      </div>
      <div className={styles.BottomNav}>
        <div className={styles.BottomNavHeader}>
          <div className={styles.SliderContainer}>
            <Slider defaultValue={imageSize} max={200} min={0} onChange={v => setImageSize(v)} />
            <span>{imageSize}%</span>
          </div>
          {selectedImage && <h3 className={styles.ImageName}>{selectedImage.name}</h3>}
          <div className={styles.ArrowButtons}>
            <Button onClick={goToPrevPage} size="md" icon={<AngleLeftIcon />} />
            <Button onClick={goToNextPage} size="md" icon={<AngleRightIcon />} />
          </div>
        </div>
        <div className={styles.Gallery} ref={galleryEl}>
          {images.map((image, idx) => (
            <ImageCard
              key={idx}
              className={classNames(styles.GalleryItem, {
                [styles.CurrentItem]: image.id === selectedImage?.id
              })}
              image={image as AssetData & Photo}
              selectImage={onSelectImage}
              paused={pause}
            />
          ))}
        </div>
        <div className={styles.ScrollToNext}>
          <Button onClick={scrollToRight} size="md" icon={<AngleRightIcon />} />
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: { smartcrop: SmartCropStructType }) => ({
  stop: state.smartcrop.stop,
  pause: state.smartcrop.pause,
  processedCount: state.smartcrop.processed,
  showMarker: state.smartcrop.showMarker,
  uploadedMedia: state.smartcrop.uploadedMedia,
  automationJob: state.smartcrop.automationJob
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  addCroppedImage: (img: Photo) => dispatch(addCroppedImg(img)),
  updateTotalCount: (total: number) => dispatch(updateTotalAssetCount(total))
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(SmartCropInProgress);

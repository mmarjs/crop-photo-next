import { createRef, KeyboardEvent, useCallback, useEffect, useMemo, useState } from "react";
import isEmpty from "lodash/isEmpty";
import { useTranslation } from "react-i18next";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { Spin, Col, Row } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import IconDownload from "../../assets/icons/icon-download.svg";

import { Button, PrimaryButton } from "../button";
import { Checkbox } from "../checkbox";
import { Dropdown } from "../dropdown";
import classNames from "classnames";
import { HLayout } from "../hLayout";
import LazyLoad from "react-lazyload";
import IconAngleDown from "../../assets/icons/icon-angle-down.svg";

import styles from "./summary-gallery.module.scss";
import { Photo } from "../../../common/Types";
import SummaryCard from "../summary-card/summary-card";
import { AUTOMATION_STATUS } from "../../../common/Enums";
import { Logger } from "aws-amplify";
import { CustomModal } from "../modal";
import { useAutomationStatus, useCroppedImages, useDownloadAll } from "../../smart-crop-components/jotai";

enum Select {
  ALL = "all",
  VISIBLE = "visible"
}

interface MediaGalleryProps {
  selectedImages: string[];
  onSearchImages: Function;
  onSelectImages: Function;
  onSelectChange: (selections: string[]) => void;
  onClearSearch: Function;
  totalImagesLength: number;
  failedImagesLength: number;
  currentImagesLength: number;
  getNextResultsPage: Function;
  isDownloading: boolean;
  className: string;
  isLoaded: boolean;
  onSingleCardDownload: Function;
  onDownload: Function;
  onOpenEditPanel: Function;
  downloadText?: string;
  totalDownloadCount: number;
  leftPanelActive?: boolean;
}
const logger = new Logger("ui-components:components:summary-gallery");
function SummaryGallery({
  selectedImages,
  onSearchImages,
  onSelectImages,
  onSelectChange,
  onClearSearch,
  totalImagesLength,
  failedImagesLength,
  getNextResultsPage,
  isLoaded,
  onSingleCardDownload,
  onDownload,
  onOpenEditPanel,
  downloadText,
  isDownloading,
  totalDownloadCount,
  leftPanelActive
}: MediaGalleryProps) {
  const [searchText, setSearchText] = useState<string>("");
  const [nextPageLoading, setNextPageLoading] = useState<boolean>(false);
  const [showDownloadAllModal, setShowDownloadAllModal] = useState<boolean>(false);
  const galleryRef = createRef<HTMLDivElement>();
  const [automationStatus] = useAutomationStatus();
  const isRunning = automationStatus === AUTOMATION_STATUS.RUNNING;
  const { t } = useTranslation();
  const [allSelected, setAllSelected] = useState<boolean>(false);
  const [croppedImages] = useCroppedImages();
  const [downloadAll, updateDownloadAll] = useDownloadAll();
  // const [staticCroppedImage, setStaticCroppedImage] = useState<Photo>();
  logger.debug("croppedImages:", croppedImages);
  const getCleanImageIds = useCallback(() => {
    //NOTE: commented out filter for no face detected images
    // const validImages = images.filter(image => !image.errorCode);
    return croppedImages.map(image => image.id);
  }, [croppedImages]);

  // //------------------------------------static image test start ---------------------------//

  // useEffect(() => {
  //   if (croppedImages.length > 0) {
  //     setStaticCroppedImage({
  //       id: croppedImages[0].id,
  //       name: "test",
  //       thumbnailUrl:
  //         "https://dev-pico-asset-storage-bucket-firefly.s3.us-east-2.amazonaws.com/test/erase-restore/crop-13223-x0.000000-y0.132463-w1.000000-h0.867537--1x-1-ORIGINAL-crop_from-thumb.webp?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230210T062718Z&X-Amz-SignedHeaders=host&X-Amz-Expires=601200&X-Amz-Credential=AKIA2Z2YBMQAZUBAZMXH%2F20230210%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=71e6a1a0c4d105c3b6b5b807e89c6f25184d8ea6358f491be6be262487118055",
  //       customBgUrl:
  //         "https://dev-pico-asset-storage-bucket-firefly.s3.us-east-2.amazonaws.com/test/erase-restore/static_bkg_img.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230210T062718Z&X-Amz-SignedHeaders=host&X-Amz-Expires=601200&X-Amz-Credential=AKIA2Z2YBMQAZUBAZMXH%2F20230210%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=f4795fd68eeae37ed79c0c0b2d0dd7cb84c28ac93b6f16a0581991a155e18b5d",
  //       originImgUrl:
  //         "https://dev-pico-asset-storage-bucket-firefly.s3.us-east-2.amazonaws.com/test/erase-restore/crop-13223-cropped-with-bg-640x832.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230210T062718Z&X-Amz-SignedHeaders=host&X-Amz-Expires=601200&X-Amz-Credential=AKIA2Z2YBMQAZUBAZMXH%2F20230210%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=aa5b4e697092f4ebd98acf429475d44115878feb155a2be865ce6252c517ec91",
  //       size: croppedImages[0].size,
  //       isoDate: croppedImages[0].isoDate,
  //       imageUrl:
  //         "https://dev-pico-asset-storage-bucket-firefly.s3.us-east-2.amazonaws.com/test/erase-restore/crop-13223-x0.000000-y0.132463-w1.000000-h0.867537--1x-1-ORIGINAL-crop_from.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230210T062718Z&X-Amz-SignedHeaders=host&X-Amz-Expires=601200&X-Amz-Credential=AKIA2Z2YBMQAZUBAZMXH%2F20230210%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Signature=18ed5afd6f39864f79f803fd66c8512520b01cac8426935cb5f0f8890eb50f83",
  //       errorCode: croppedImages[0].errorCode,
  //       warnCode: croppedImages[0].warnCode,
  //       dimension: croppedImages[0].dimension,
  //       cropConfigName: croppedImages[0].cropConfigName
  //     });
  //   }
  // }, [croppedImages]);

  // //------------------------------------static image test end ---------------------------//

  useEffect(() => {
    if (allSelected) {
      const imageIds = getCleanImageIds();
      onSelectImages(imageIds);
    }
  }, [onSelectImages, allSelected, croppedImages, getCleanImageIds]);

  const handlePressEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (onSearchImages) {
      const isSearchFromServer = onSearchImages((e.target as HTMLInputElement).value);
      if (!isSearchFromServer) {
        setSearchText((e.target as HTMLInputElement).value);
      }
    } else {
      setSearchText((e.target as HTMLInputElement).value);
    }
  };

  function handleFilterNameChange(value: string) {
    if (isEmpty(value)) {
      onClearSearch();
    }
  }

  const handleClear = () => {
    onClearSearch();
  };

  const getFilteredImages = (images: Photo[], searchText: string) => {
    if (searchText) {
      return images.filter(img => img?.name.toUpperCase().includes(searchText.toUpperCase()));
    } else {
      return images;
    }
  };

  const galleryScrollListener = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      logger.debug("galleryScrollListener status", automationStatus);

      const scrollHeight = (e.target as HTMLDivElement).scrollHeight;
      const scrollTop = (e.target as HTMLDivElement).scrollTop;
      const clientHeight = (e.target as HTMLDivElement).clientHeight;
      const filteredImages = getFilteredImages(croppedImages, searchText);
      if (Math.ceil(scrollTop) === Math.ceil(scrollHeight - clientHeight)) {
        if (
          totalImagesLength !== undefined &&
          getNextResultsPage &&
          filteredImages.length < totalImagesLength &&
          !nextPageLoading
        ) {
          setNextPageLoading(true);
          getNextResultsPage().then(() => {
            setNextPageLoading(false);
          });
        }
      }
    },
    [automationStatus, croppedImages, searchText, totalImagesLength, getNextResultsPage, nextPageLoading]
  );

  const handleSelectAll = useCallback(() => {
    const imageIds = getCleanImageIds();
    if (selectedImages.length > 0) {
      onSelectImages([]);
      updateDownloadAll(false);
      setAllSelected(false);
    } else {
      setAllSelected(true);
      onSelectImages(imageIds);
      updateDownloadAll(true);
    }
  }, [getCleanImageIds, onSelectImages, selectedImages, updateDownloadAll]);

  const handleSelectAllVisible = useCallback(() => {
    const imageIds = getCleanImageIds();
    if (selectedImages.length > 0) {
      onSelectImages([]);
    } else {
      onSelectChange(imageIds as string[]);
    }
    if (allSelected) {
      setAllSelected(false);
    }
    if (downloadAll) {
      updateDownloadAll(false);
    }
  }, [allSelected, downloadAll, getCleanImageIds, onSelectChange, onSelectImages, selectedImages, updateDownloadAll]);

  const handleSelectChange = (e: CheckboxChangeEvent) => {
    if (e.target.checked) {
      handleSelectAll();
    } else {
      updateDownloadAll(false);
      setAllSelected(false);
      onSelectChange([]);
    }
  };

  const dropdownMenu = useMemo(
    () => [
      {
        id: Select.ALL,
        label: "Select all",
        onClick: handleSelectAll
      },
      {
        id: Select.VISIBLE,
        label: "Select visible",
        onClick: handleSelectAllVisible
      }
    ],
    [handleSelectAll, handleSelectAllVisible]
  );

  const handleSelectImage = (e: CheckboxChangeEvent, croppedId: string) => {
    if (e.target.checked) {
      onSelectChange([...selectedImages, croppedId]);
    } else {
      const index = selectedImages.indexOf(croppedId);
      selectedImages.splice(index, 1);
      onSelectChange([...selectedImages]);
    }
  };

  const colProps = leftPanelActive
    ? {
        xs: 24,
        sm: 24,
        md: 24,
        lg: 12,
        xl: 8,
        xxl: 6
      }
    : {
        xs: 24,
        sm: 12,
        md: 8,
        lg: 6,
        xl: 6,
        xxl: 4
      };

  return (
    <>
      <div className={styles.Header}>
        <Dropdown dropdownItems={dropdownMenu} placement="bottomLeft" triggerOn="click">
          <Button className={styles.Checker}>
            <Checkbox
              onChange={handleSelectChange}
              checked={croppedImages?.length > 0 && selectedImages.length === croppedImages.length}
              indeterminate={selectedImages.length > 0 && selectedImages.length < croppedImages.length}
              onClick={e => e.stopPropagation()}
            />
            <IconAngleDown />
          </Button>
        </Dropdown>
        <div className={styles.SearchBox}>
          {/* <SearchInput onPressEnter={handlePressEnter} onClear={handleClear} onChange={handleFilterNameChange} /> */}
          <span className={styles.totalImages}>
            {totalImagesLength} {`file${totalImagesLength > 1 ? "s" : ""}`}
            {failedImagesLength > 0 && (
              <>
                ({failedImagesLength} {`file${failedImagesLength > 1 ? "s" : ""} failed`})
              </>
            )}
          </span>
        </div>

        <div className={styles.Fill} />
        {isRunning ? <Button loading label="Running" disabled type="primary" /> : null}
        {isLoaded && !isRunning && (selectedImages.length >= 0 || isDownloading) && (
          <HLayout noPadding={true} noFlex={true} gap={24} style={{ marginLeft: 16 }}>
            <PrimaryButton
              icon={isDownloading ? null : <IconDownload />}
              label={downloadText}
              onClick={() => {
                // if (downloadAll && selectedImages?.length >= DOWNLOAD_LIMIT) {
                //   setShowDownloadAllModal(true);
                // } else {
                //   ;
                // }
                onDownload();
              }}
              loading={isDownloading}
              className={classNames({
                [styles.downloadingButton]: isDownloading
              })}
            />
          </HLayout>
        )}
      </div>
      {isRunning && croppedImages?.length === 0 ? (
        <div className={styles.inProgressWrapper}>
          <div className={styles.inProgressContainer}>
            <div className={styles.projectSkeleton}>
              <Spin
                className={styles.Spinner}
                indicator={<LoadingOutlined style={{ fontSize: 50, color: "#0038FF" }} spin />}
              />
              <span className={styles.Progress} />
            </div>
            <span className={styles.inProgressTitle}>{t("summary.automation_running.title")}</span>
            <span className={styles.inProgressText}>{t("summary.automation_running.desc")}</span>
          </div>
        </div>
      ) : null}
      {croppedImages?.length > 0 && isLoaded ? (
        <div ref={galleryRef} className={classNames(styles.CardList)} onScroll={galleryScrollListener}>
          <Row gutter={[32, 24]}>
            {croppedImages.map((image, index) => (
              <Col key={index} {...colProps}>
                <LazyLoad once overflow throttle={100} height={200}>
                  <SummaryCard
                    image={image}
                    isSelected={!!selectedImages.find(imageId => imageId === image.id)}
                    onSelect={handleSelectImage}
                    onDownload={onSingleCardDownload}
                    onEdit={onOpenEditPanel}
                  />
                </LazyLoad>
              </Col>
            ))}
          </Row>
          {/* ---------------------------test start--------------*/}
          {
            // staticCroppedImage ? (
            //   <Row gutter={[32, 24]}>
            //     {/* {croppedImages.map((image, index) => ( */}
            //     <Col {...colProps}>
            //       <LazyLoad once overflow throttle={100} height={200}>
            //         <MediaCard
            //           image={staticCroppedImage}
            //           isSelected={!!selectedImages.find(imageId => imageId === staticCroppedImage.id)}
            //           onSelect={handleSelectImage}
            //           onDownload={onSingleCardDownload}
            //           onEdit={onOpenEditPanel}
            //         />
            //       </LazyLoad>
            //     </Col>
            //     {/* ))} */}
            //   </Row>
            // ) : null
          }
          {/*---------------------------test end-------------- */}
        </div>
      ) : null}
      {nextPageLoading ? (
        <Row justify="center" style={{ marginTop: "1.5rem", marginBottom: "1rem" }}>
          <Col>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 50, color: "#0038FF" }} spin />} />
          </Col>
        </Row>
      ) : null}
      {croppedImages?.length === 0 && !isLoaded && !isRunning ? (
        <div className={styles.inProgressWrapper}>
          <div className={styles.projectSkeleton}>
            <Spin
              className={styles.Spinner}
              indicator={<LoadingOutlined style={{ fontSize: 50, color: "#0038FF" }} spin />}
            />
            <span className={styles.Progress} />
          </div>
        </div>
      ) : null}
      {croppedImages?.length === 0 && isLoaded && !isRunning ? (
        <div className={styles.noResult}>{t("upload.no_search_result")}</div>
      ) : null}
      <CustomModal
        title={t("summary.download_all_modal.title", { count: totalDownloadCount })}
        okText={t("summary.download_all_modal.ok_text")}
        cancelText={t("summary.download_all_modal.cancel_text")}
        visible={showDownloadAllModal}
        onOk={() => {
          onDownload();
          setShowDownloadAllModal(false);
        }}
        onCancel={() => setShowDownloadAllModal(false)}
        type="primary"
      >
        <p className={styles.DeleteModalContent}>{t("summary.download_all_modal.desc")}</p>
      </CustomModal>
    </>
  );
}

export default SummaryGallery;

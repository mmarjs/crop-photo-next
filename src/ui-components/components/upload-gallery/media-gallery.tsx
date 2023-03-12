import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { KeyboardEvent, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { UploadingPhoto } from "../../../common/Types";
import { Button } from "../button";
import { Checkbox } from "../checkbox";
import { SearchInput } from "../search-input";
import { MediaCard } from "../upload-card";
import styles from "./media-gallery.module.scss";
import IconAngleDown from "../../assets/icons/icon-angle-down.svg";
import { Dropdown } from "../dropdown";
import classNames from "classnames";
import { HLayout } from "../hLayout";
import { Col, Row } from "antd";
import LazyLoad from "react-lazyload";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { isEmpty } from "lodash";
import { useTranslation } from "react-i18next";
import { Tooltip } from "../tooltip";
import { useIsUploadingAssets, useTotalAssetCount } from "../../smart-crop-components/jotai";
import { Logger } from "aws-amplify";

enum Select {
  ALL = "all",
  VISIBLE = "visible"
}

interface MediaGalleryProps {
  images: UploadingPhoto[];
  selected: string[];
  action: ReactNode;
  onSelectionChanged: Function;
  onDeletion?: (imageId: string) => void;
  className?: string;
  totalUploadedCardsLength?: number;
  getNewUploadedPage?: Function;
  searchAssets?: (searchText: string) => boolean;
  setSelectAll?: Function;
  onIgnoredForDelete?: Function;
  ignoredForDelete?: string[];
  nextPageLoaded?: boolean;
  setNextPageLoaded?: Function;
  uploadFiles: (fileList: File[]) => void;
  dropZoneInputProps: any;
  isUploadRunning?: boolean;
  leftPanelActive?: boolean;
}

const MediaGallery = ({
  images,
  selected,
  action,
  onSelectionChanged,
  onDeletion,
  className,
  totalUploadedCardsLength,
  getNewUploadedPage,
  searchAssets,
  setSelectAll,
  onIgnoredForDelete,
  ignoredForDelete,
  nextPageLoaded,
  setNextPageLoaded,
  uploadFiles,
  dropZoneInputProps,
  isUploadRunning,
  leftPanelActive = false
}: MediaGalleryProps) => {
  const logger = new Logger("ui-components:components:upload-gallery:MediaGallery");
  const [searchText, setSearchText] = useState("");
  const [renderedCards, setRenderedCards] = useState<UploadingPhoto[]>([]);
  const [nextPageLoading, setNextPageLoading] = useState(false);
  const [isSelectAllAsset, setSelectAllAsset] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  const viewMediaFileUploaderRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  const [, updateTotalAssetCount] = useTotalAssetCount();
  const [, setIsUploading] = useIsUploadingAssets();

  useEffect(() => {
    setRenderedCards(getTotalCards(images, searchText));
  }, [searchText, images]);

  useEffect(() => {
    logger.debug("media-gallery total", totalUploadedCardsLength, isUploadRunning);
    updateTotalAssetCount(totalUploadedCardsLength as number);
    setIsUploading(isUploadRunning!);
    return () => {
      updateTotalAssetCount(0);
      setIsUploading(false);
    };
  }, [totalUploadedCardsLength, isUploadRunning, updateTotalAssetCount, setIsUploading]);

  useEffect(() => {
    if (nextPageLoaded) {
      onSelectionChanged(
        images.map(image => {
          if (ignoredForDelete?.includes(image.id)) return false;
          else return image.id;
        })
      );
      if (setNextPageLoaded) setNextPageLoaded(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ignoredForDelete, images, nextPageLoaded]);

  const selectAll = () => {
    setSelectAllAsset(true);
    if (setSelectAll) {
      setSelectAll(true);
    }
    onSelectionChanged(images.map(img => img.id));
    // onSelectionChanged(images.filter(image => !image?.isUploading).map(img => img.id));
    if (onIgnoredForDelete) onIgnoredForDelete([]);
  };

  const selectVisibleImgs = () => {
    onSelectionChanged(renderedCards.map(img => img.id));
    // onSelectionChanged(renderedCards.filter(image => !image?.isUploading).map(img => img.id));
  };

  const toggleSelection = (e: CheckboxChangeEvent) => {
    if (e.target.checked) {
      selectAll();
    } else {
      if (setSelectAll) {
        setSelectAll(false);
      }
      setSelectAllAsset(false);
      onSelectionChanged([]);
      if (onIgnoredForDelete) onIgnoredForDelete([]);
    }
  };

  const selectCard = useCallback(
    (e: CheckboxChangeEvent, imageId: string) => {
      if (e.target.checked) {
        if (isSelectAllAsset && ignoredForDelete && onIgnoredForDelete) {
          const foundIdx = ignoredForDelete?.indexOf(imageId);
          if (foundIdx != undefined && foundIdx > -1) {
            ignoredForDelete?.splice(foundIdx, 1);
            onIgnoredForDelete([...ignoredForDelete]);
          }
        }
        onSelectionChanged([...selected, imageId]);
      } else {
        if (isSelectAllAsset && ignoredForDelete && onIgnoredForDelete) {
          onIgnoredForDelete([...ignoredForDelete, imageId]);
        }
        const foundIdx = selected.indexOf(imageId);
        selected.splice(foundIdx, 1);
        onSelectionChanged([...selected]);
      }
    },
    [isSelectAllAsset, ignoredForDelete, onIgnoredForDelete, onSelectionChanged, selected]
  );

  const searchImages = (e: KeyboardEvent<HTMLInputElement>) => {
    setSelectAllAsset(false);
    if (searchAssets) {
      const isSearchFromServer = searchAssets((e.target as HTMLInputElement).value);
      if (!isSearchFromServer) {
        setSearchText((e.target as HTMLInputElement).value);
      }
    } else {
      setSearchText((e.target as HTMLInputElement).value);
    }
  };

  function handleFilterNameChange(value: string) {
    if (isEmpty(value)) {
      onClear();
    }
  }

  const onClear = () => {
    if (searchAssets) {
      const isSearchFromServer = searchAssets("");
      if (!isSearchFromServer) {
        setSearchText("");
      }
    } else {
      setSearchText("");
    }
  };

  const getTotalCards = (images: UploadingPhoto[], searchText: string) => {
    if (searchText) {
      return images.filter(img => img?.name.toUpperCase().includes(searchText.toUpperCase()));
    } else {
      return images;
    }
  };

  const galleryScrollListener = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      const scrollHeight = (e.target as HTMLDivElement).scrollHeight;
      const scrollTop = (e.target as HTMLDivElement).scrollTop;
      const clientHeight = (e.target as HTMLDivElement).clientHeight;
      const totalCards = getTotalCards(images, searchText);
      if (Math.ceil(scrollTop) === Math.ceil(scrollHeight - clientHeight)) {
        if (
          totalUploadedCardsLength != undefined &&
          getNewUploadedPage &&
          totalCards.length < totalUploadedCardsLength &&
          !nextPageLoading
        ) {
          setNextPageLoading(true);
          getNewUploadedPage().then(() => {
            setNextPageLoading(false);
          });
        }
      }
    },
    [images, searchText, totalUploadedCardsLength, getNewUploadedPage, nextPageLoading]
  );

  const menu = [
    {
      id: Select.ALL,
      label: "Select all",
      onClick: selectAll
    },
    {
      id: Select.VISIBLE,
      label: "Select visible",
      onClick: selectVisibleImgs
    }
  ];

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

  const onFileChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // @ts-ignore
      uploadFiles(e.target.files);
    }
  };

  return (
    <>
      <div className={styles.Header}>
        <Dropdown dropdownItems={menu} placement="bottomLeft" triggerOn="click">
          <Button className={styles.Checker}>
            <Checkbox
              onChange={toggleSelection}
              checked={selected.length > 0 && selected.length === images.length}
              indeterminate={selected.length > 0 && selected.length < images.length}
              onClick={e => e.stopPropagation()}
            />
            <IconAngleDown />
          </Button>
        </Dropdown>
        <div className={styles.SearchBox}>
          <SearchInput onPressEnter={searchImages} onClear={onClear} onChange={handleFilterNameChange} />
        </div>
        <div className={styles.Fill} />

        <HLayout noPadding={true} noFlex={true} gap={24}>
          {selected.length > 0 && <>{action}</>}

          <div>
            <input {...dropZoneInputProps()} ref={viewMediaFileUploaderRef} />
            <Tooltip title={t("upload.upload_more_tooltip_text")} placement="top">
              <div className={styles.uploadMoreBtn} onClick={() => viewMediaFileUploaderRef.current?.click()}>
                <img src="/images/upload@1x.svg" />
                <span>{t("upload.upload_more")}</span>
              </div>
            </Tooltip>
          </div>
        </HLayout>
      </div>
      {renderedCards.length > 0 ? (
        <div ref={galleryRef} className={classNames(styles.CardList, className)} onScroll={galleryScrollListener}>
          <Row style={{}} gutter={[32, 24]}>
            {renderedCards.map((image, idx) => (
              <Col key={idx} {...colProps}>
                <LazyLoad once overflow throttle={100} height={200}>
                  <MediaCard
                    key={idx}
                    image={image}
                    selected={!!selected.find(checked => checked === image.id)}
                    onSelect={selectCard}
                    onDelete={onDeletion}
                  />
                </LazyLoad>
              </Col>
            ))}
          </Row>
          {nextPageLoading ? (
            <Row justify="center" style={{ marginTop: "1.5rem", marginBottom: "1rem" }}>
              <Col>
                <Spin indicator={<LoadingOutlined style={{ fontSize: 50, color: "#0038FF" }} spin />} />
              </Col>
            </Row>
          ) : null}
        </div>
      ) : (
        <div className={styles.noResult}>{t("upload.no_search_result")}</div>
      )}
    </>
  );
};

export default MediaGallery;

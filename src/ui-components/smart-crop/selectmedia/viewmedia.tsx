import styles from "../../../styles/UploadMedia.module.css";
import { Button } from "../../../ui-components/components/button";
import { Progress } from "../../../ui-components/components/progress";
import { MediaGallery } from "../../components/upload-gallery";
import DeleteIcon from "../../../../public/images/delete.svg";
import { UploadController } from "../../../controller/UploadController";
import { useEffect, useMemo, useState } from "react";
import { UPLOAD_STATUS } from "../../../common/Enums";
import { CustomModal } from "../../../ui-components/components/modal";
import { UploadingPhoto } from "../../../common/Types";
import { ActiveOptionProps } from "../../../ui-components/components/project-card/project-card";
import { useTranslation } from "react-i18next";
import AssetsView from "../../../controller/AssetsView";

type ViewMediaProps = {
  uploadController: UploadController;
  uploadFiles: (fileList: File[]) => void;
  assetsView: AssetsView;
  dropZoneInputProps: any;
  leftPanelActive?: boolean;
};

const ViewMedia = (props: ViewMediaProps) => {
  const uploadController = props.uploadController;
  const assetsView = props.assetsView;
  const [selectedImgs, setSelectedImgs] = useState<string[]>([]);
  const [ignoredForDelete, updateIgnoredForDelete] = useState<string[]>([]);
  const [visibleDeleteModal, toggleDeleteModal] = useState(false);
  const [modalName, setModalName] = useState<string | undefined>();
  const [isSelectAll, setSelectALL] = useState<boolean>(false);
  const [nextPageLoaded, setNextPageLoaded] = useState(false);
  const { t } = useTranslation();

  const getPercent = () => {
    const total = uploadController.getTotal();
    const uploadedFilesCount = uploadController.getFinishedCount();
    return Math.floor((uploadedFilesCount / total) * 100);
  };

  let images: UploadingPhoto[] = [];
  const setImagesForUI = () => {
    const files = assetsView.getFiles();
    images = files.map((uploadItem, ix) => {
      const file = uploadItem.getFile();
      let image: UploadingPhoto = {
        name: uploadItem.getName(),
        percent: uploadItem.getUploadProgress(),
        size: file ? uploadItem.getFile()?.size : uploadItem.getSize(),
        lastModified: uploadItem.getFile()?.lastModified,
        id: uploadItem.getUiId(),
        thumbnailUrl: "",
        file: file,
        isUploading: true,
        isThumbGenerated: uploadItem.isThumbGenerated(),
        assetId: uploadItem.getId()
      };
      if (uploadItem.getStatus() === UPLOAD_STATUS.FINISHED && uploadItem.getThumbnailUrl()) {
        image.thumbnailUrl = uploadItem.getThumbnailUrl();
        delete image.isUploading;
      }
      return image;
    });
    return images;
  };

  setImagesForUI();

  const modalContent: ActiveOptionProps = useMemo(() => {
    switch (modalName) {
      case "delete":
        //Todo: i18n not here. @achin.
        const count = isSelectAll ? assetsView.getTotal() - ignoredForDelete.length : selectedImgs.length;
        let title = t("upload.delete.title", {
          count
        });
        let okText = t("upload.delete.okText", {
          count
        });
        return {
          title: title,
          okText: okText,
          cancelText: t("upload.delete_modal_cancel_button_text"),
          type: "danger",
          onOk: () => {
            assetsView.delete(selectedImgs, isSelectAll, ignoredForDelete);
            setSelectedImgs([]);

            if (isSelectAll) {
              updateIgnoredForDelete([]);
              setSelectALL(false);
            }
            toggleDeleteModal(false);
          }
        };

      case "singleDelete":
        return {
          title: t("asset.confirm_delete"),
          okText: t("asset.delete"),
          cancelText: t("upload.delete_modal_cancel_button_text"),
          type: "danger",
          onOk: () => {
            assetsView.delete([selectedImgs[0]], false, []);
            setSelectedImgs([]);
            toggleDeleteModal(false);
          }
        };

      case "cancel":
        return {
          title: t("upload.confirm_upload_cancel"),
          okText: t("upload.cancel_upload_ok_button_text"),
          cancelText: t("upload.cancel_upload_text"),
          type: "danger",
          onOk: () => {
            uploadController.delete([], true, []);
            toggleDeleteModal(false);
          }
        };
      default: {
        return {
          title: "",
          okText: "",
          cancelText: "",
          onOk: () => {},
          type: "default",
          body: <div>Something went wrong</div>
        };
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalName, isSelectAll, assetsView, ignoredForDelete, selectedImgs, uploadController]);

  const onDelete = () => {
    setModalName("delete");
    toggleDeleteModal(true);
  };

  const onCancelUpload = () => {
    setModalName("cancel");
    toggleDeleteModal(true);
  };

  const onSingleAssetDelete = (imgId: string) => {
    setSelectedImgs([imgId]);
    setModalName("singleDelete");
    toggleDeleteModal(true);
  };

  const getNextPage = () => {
    return new Promise((resolve, reject) => {
      assetsView.loadNextPage().then(result => {
        if (isSelectAll) setNextPageLoaded(true);
        resolve(result);
      });
    });
  };

  return (
    <div className={styles.ViewMediaWrapper}>
      <div className={styles.Header}>
        {!uploadController.isRunning() && (
          <>
            <span className={styles.TotalFiles}>
              {assetsView.getTotal()} {assetsView.getTotal() === 1 ? "file" : "files"}
            </span>
          </>
        )}
        {uploadController.isRunning() && (
          <>
            <span className={styles.TotalFiles}>
              {t("upload.uploading_message", {
                total: assetsView.getTotal(),
                assets: assetsView.getTotal() === 1 ? "file" : "files"
              })}
            </span>
            <span className={styles.Progress}>{getPercent()}%</span>
            <Progress className={styles.ProgressBar} percent={getPercent()} />
            <span className={styles.ProgressOverview}>
              {uploadController.getFinishedCount()}/{assetsView.getTotal()}
            </span>
            <Button size="sm" icon={<DeleteIcon />} type="text" onClick={onCancelUpload} />
          </>
        )}
      </div>
      <MediaGallery
        isUploadRunning={uploadController.isRunning()}
        images={images}
        selected={selectedImgs}
        onSelectionChanged={setSelectedImgs}
        ignoredForDelete={ignoredForDelete}
        onIgnoredForDelete={updateIgnoredForDelete}
        onDeletion={onSingleAssetDelete}
        totalUploadedCardsLength={assetsView.getTotal()}
        getNewUploadedPage={getNextPage}
        setSelectAll={setSelectALL}
        nextPageLoaded={nextPageLoaded}
        setNextPageLoaded={setNextPageLoaded}
        searchAssets={(searchText: string) => {
          setSelectedImgs([]);
          setSelectALL(false);
          return assetsView.search(searchText);
        }}
        action={
          <Button
            type="text"
            icon={<DeleteIcon />}
            label={t("upload.delete.deleteBtn_text", {
              count: isSelectAll ? assetsView.getTotal() - ignoredForDelete.length : selectedImgs.length
            })}
            onClick={onDelete}
          />
        }
        uploadFiles={props.uploadFiles}
        dropZoneInputProps={props.dropZoneInputProps}
        leftPanelActive={props.leftPanelActive}
      />

      <CustomModal
        title={`${modalContent.title}`}
        okText={modalContent.okText}
        cancelText={modalContent.cancelText}
        disableOk={modalContent.disableOk}
        visible={visibleDeleteModal}
        onOk={modalContent.onOk}
        onCancel={() => toggleDeleteModal(false)}
        type={"danger"}
        danger
      >
        <p className={styles.DeleteModalContent}>{t("upload.delete.desc")}</p>
      </CustomModal>
    </div>
  );
};

export default ViewMedia;

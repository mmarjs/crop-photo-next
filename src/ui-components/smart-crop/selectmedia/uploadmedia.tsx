import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../../../ui-components/components/button";
import styles from "../../../styles/UploadMedia.module.css";
import Image from "next/image";
import ViewMedia from "./viewmedia";
import { useTranslation } from "react-i18next";
import AssetsView from "../../../controller/AssetsView";
import { UploadController } from "../../../controller/UploadController";
import Dropzone, { Accept } from "react-dropzone";
import { ACCEPTED_EXTENSIONS_FOR_UPLOAD } from "../../utils/Constants";

const MAX_LIMIT_PER_DROP = 500;
const ACCEPTED = ACCEPTED_EXTENSIONS_FOR_UPLOAD.map(f => f).join(", ");

export type UploadMediaProps = {
  /**
   * Method for upload  the files
   */
  uploadFiles: (filesList: File[]) => void;
  className?: string;
  isGallery?: boolean;
  assetsView: AssetsView;
  uploadController: UploadController;
  leftPanelActive?: boolean;
};

const UploadMedia = (uploadMediaProps: UploadMediaProps) => {
  const { uploadFiles, isGallery } = uploadMediaProps;
  const [acceptedFiles, setAcceptedFiles] = useState<File[]>([]);
  const { t } = useTranslation();
  const fileUploaderRef = useRef<HTMLInputElement>(null);

  const handleUploadFiles = useCallback(
    (files: File[]) => {
      uploadFiles(files);
    },
    [uploadFiles]
  );

  const handleOnDrop = (files: File[]) => {
    setAcceptedFiles(files);
  };

  useEffect(() => {
    if (acceptedFiles?.length > 0) {
      handleUploadFiles(acceptedFiles);
    }
  }, [acceptedFiles, handleUploadFiles]);

  return (
    <div className={!isGallery ? styles.DraggerWrapper : styles.GalleryDraggerWrapper}>
      <Dropzone
        accept={{ accept: ACCEPTED_EXTENSIONS_FOR_UPLOAD }}
        onDrop={handleOnDrop}
        maxFiles={MAX_LIMIT_PER_DROP}
        noClick
        noKeyboard
      >
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps({ className: "dropzone" })}>
            {" "}
            {!isGallery && (
              <>
                <div className={styles.uploadMedia_draggerDiv} style={{ textAlign: "center" }}>
                  <p className="ant-upload-drag-icon">
                    <Image src="/images/upload-media.svg" height={204} width={204} alt="" />
                  </p>
                  <div className={styles.uploadMedia_dragAndDropText}>
                    <span>{t("upload.drag_and_dropped.title")}</span>
                  </div>
                  <div className={styles.uploadMedia_dragAndDropText2}>
                    <span>{t("upload.drag_and_dropped.subtitle")}</span>
                  </div>
                  <div className={styles.uploadMedia_dragAndDropText3}>
                    <span>
                      {t("upload.drag_and_dropped.desc_1")}
                      <br />
                      {t("upload.drag_and_dropped.desc_2")}
                    </span>
                  </div>
                </div>
                <div className={styles.uploadButtonDiv}>
                  <input {...getInputProps()} ref={fileUploaderRef} />
                  <Button
                    className={styles.uploadButton}
                    label={t("upload.select_from_device")}
                    icon={<Image src="/images/upload_outlined@1x.svg" height={16.6} width={16.6} alt="" />}
                    onClick={() => {
                      fileUploaderRef.current?.click();
                    }}
                  />
                </div>
              </>
            )}
            {isGallery && (
              <ViewMedia
                dropZoneInputProps={getInputProps}
                assetsView={uploadMediaProps.assetsView}
                uploadController={uploadMediaProps.uploadController}
                uploadFiles={uploadFiles}
                leftPanelActive={uploadMediaProps.leftPanelActive}
              />
            )}
          </div>
        )}
      </Dropzone>
    </div>
  );
};

export default UploadMedia;

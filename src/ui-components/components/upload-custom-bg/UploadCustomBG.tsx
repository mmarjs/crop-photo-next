/* eslint-disable @next/next/no-img-element */
import { DeleteOutlined, LoadingOutlined } from "@ant-design/icons";
import { Radio, RadioChangeEvent, Skeleton, Spin, Tooltip, Typography } from "antd";
import { Logger } from "aws-amplify";
import { useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useImageViewerParameter, useCustomBackgroundPaths } from "../../smart-crop-components/jotai";
import { toast } from "../toast";
import styles from "./upload-custom-bg.module.scss";
import CustomBackgroundImagesController from "./CustomBackgroundImagesController";
import { t } from "i18next";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { StringUtil } from "../../utils";

const { Paragraph, Text } = Typography;
const logger = new Logger("ui-components:upload-custom-bg");
const UPLOAD_EXTENSIONS = ["jpeg", "jpg"];

export default function UploadCustomBackground() {
  const [parent] = useAutoAnimate();
  //All the custom BG images
  const [uploadedCustomBackgroundImages, setUploadedCustomBackgroundImages] = useState<string[]>([]);
  const [parameter] = useImageViewerParameter();
  const [progress, setProgress] = useState(0);
  //Custom background paths -> This tells the user selected custom background paths. First time, it might be null.
  const [customBackgroundPaths, setCustomBackgroundPaths] = useCustomBackgroundPaths();
  const [uploading, setUploading] = useState(false);
  const [customBackgroundImagesController] = useState(new CustomBackgroundImagesController());

  function loadCustomBackgroundImageDetails() {
    customBackgroundImagesController
      .loadBackgroundImages()
      .then(results => {
        logger.debug("Loaded custom background images from S3", results);
        setUploadedCustomBackgroundImages(results);
        if (!customBackgroundPaths || customBackgroundPaths.length === 0) {
          if (results && results.length > 0) {
            setCustomBackgroundPaths([results[0]]);
          }
        }
      })
      .catch(error => {
        toast(error, "error");
      });
  }

  useEffect(() => {
    logger.debug("Current selected custom bg image: ", customBackgroundPaths);
    if (parameter === "bg-image") {
      loadCustomBackgroundImageDetails();
    }
    // eslint-disable-next-line
  }, [parameter]);

  function deleteFile(backgroundImagePath: string) {
    logger.debug("Deleting custom background file: ", backgroundImagePath);
    customBackgroundImagesController
      .deleteFile(backgroundImagePath)
      .then(() => {
        logger.debug("Deleted custom background file: ", backgroundImagePath, selectCustomBackground);
      })
      .catch(error => {
        toast(error, "error");
      })
      .finally(() => {
        customBackgroundImagesController.setRefresh(true);
        loadCustomBackgroundImageDetails();
      });
  }

  function onProgress(progress: number) {
    setProgress(progress);
  }

  function onDrop(droppedFiles: File[]) {
    const TEN_MB = 10485760;
    logger.debug("Dropped files:", droppedFiles);
    if (droppedFiles.length == 0) {
      return;
    } else if (droppedFiles.length > 1) {
      toast(t("Please drop one file at a time."), "warning");
    } else if (UPLOAD_EXTENSIONS.indexOf(StringUtil.getFileExtension(droppedFiles[0].name).toLowerCase()) === -1) {
      toast(t("Only JPEG files are supported."), "warning");
    } else if (uploadedCustomBackgroundImages.length === 10) {
      toast(t("Maximum 10 files can be kept in the custom background gallery."), "error");
    } else if (droppedFiles[0].size > TEN_MB) {
      logger.debug("Maximum file size must be 10MB.");
      toast(t("Maximum file size must be 10MB."), "error");
    } else {
      logger.debug("Dropped files", droppedFiles);
      customBackgroundImagesController
        .upload(droppedFiles[0], onProgress)
        .then(() => {
          customBackgroundImagesController.setRefresh(true);
          loadCustomBackgroundImageDetails();
        })
        .catch(error => {
          toast(error, "error");
        })
        .finally(() => {
          setUploading(false);
        });
      setUploading(true);
    }
  }

  const onCustomBackgroundImageChange = (e: RadioChangeEvent) => {
    let path: string = e.target.value;
    logger.debug("onCustomBackgroundImageChange", path);
    setCustomBackgroundPaths([path]);
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
    multiple: false
  });

  const selectCustomBackground = useMemo(() => {
    if (customBackgroundPaths && customBackgroundPaths.length > 0) {
      return customBackgroundPaths[0];
    }
    if (uploadedCustomBackgroundImages && uploadedCustomBackgroundImages.length > 0) {
      return uploadedCustomBackgroundImages[0];
    }
    return null;
  }, [customBackgroundPaths, uploadedCustomBackgroundImages]);

  if (parameter !== "bg-image") {
    return null;
  }
  logger.debug("customBackgroundPaths:", customBackgroundPaths);
  return (
    <div className={styles.BackgroundImageContainer} {...getRootProps()}>
      {uploadedCustomBackgroundImages?.length > 0 ? (
        <div>
          <Radio.Group
            value={selectCustomBackground}
            className={styles.bgImageRadioGroup}
            onChange={onCustomBackgroundImageChange}
            ref={parent}
          >
            {uploadedCustomBackgroundImages.map((imagePath, index) => (
              <Radio key={index} value={imagePath}>
                <div className={styles.radioLabelContainer}>
                  <Paragraph ellipsis className={styles.bgImageRadioLabel}>
                    <Tooltip title={StringUtil.getLastSubPath(imagePath, "/")}>
                      {" "}
                      {StringUtil.getLastSubPath(imagePath, "/")}
                    </Tooltip>
                  </Paragraph>
                  <DeleteOutlined
                    onClick={e => {
                      e.preventDefault();
                      deleteFile(imagePath);
                    }}
                  />
                </div>
              </Radio>
            ))}
          </Radio.Group>
        </div>
      ) : (
        <Skeleton avatar={false} paragraph={{ rows: 4 }} />
      )}

      {uploading ? (
        <div className={styles.progressCircle}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
          <Paragraph className={styles.description}>{`Uploading ${Math.round(progress)}%...`}</Paragraph>
        </div>
      ) : (
        <div className={styles.UploadCustomBackground}>
          <input {...getInputProps()} style={{ display: "none" }} />

          <img src="/images/custom-bg.svg" alt="upload-custom-bg" />
          <Paragraph className={styles.description}>
            <Text className={styles.dragDropLabel}>Drag & Drop</Text> files here to start or
          </Paragraph>
          <Paragraph type="secondary" className={styles.subDescription} onClick={open}>
            Browse Files
          </Paragraph>
          {isDragActive ? (
            <div className={styles.dragActiveContainer}>
              <img style={{ marginBottom: "1rem" }} src="/images/cloud-upload.svg" alt="upload-cloud" />
              <div className={styles.activeDragInner}>
                <Paragraph className={styles.activeDragDesc}>Drop an image to your background:</Paragraph>
                <Paragraph className={styles.fullScreenLabel}>
                  <img src="/images/fullscreen.svg" alt="fullscreen" />
                  Unrecognizable Crop
                </Paragraph>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

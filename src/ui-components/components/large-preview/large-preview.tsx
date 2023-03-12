/* eslint-disable @next/next/no-img-element */
import { LoadingOutlined } from "@ant-design/icons";
import { Image, Spin } from "antd";
import { useState } from "react";
import { JSON_TYPE } from "../../../common/Types";
import { Button } from "../button";
import { NextIcon, PrevIcon } from "../smart-crop-config/crop-footer";
import styles from "./large-preview.module.scss";

interface LargePreviewProps {
  onPreviousImage: Function;
  onNextImage: Function;
  isFirstItem: boolean;
  isLastItem: boolean;
  largePreview: JSON_TYPE | undefined;
}

function LargePreview({ onPreviousImage, onNextImage, isFirstItem, isLastItem, largePreview }: LargePreviewProps) {
  const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false);

  return (
    <div className={styles.LargePreview}>
      {" "}
      <div className={styles.ImageContainer}>
        {!isImageLoaded ? (
          <div className={styles.projectSkeleton}>
            <Spin
              className={styles.Spinner}
              indicator={<LoadingOutlined style={{ fontSize: 50, color: "#0038FF" }} spin />}
            />
            <span className={styles.Progress} />
          </div>
        ) : null}
        <img
          src={largePreview?.url}
          onLoad={() => {
            setIsImageLoaded(true);
          }}
          alt="#"
        />
      </div>
      <div className={styles.FooterWrapper}>
        <div className={styles.ArrowButtons}>
          <Button
            onClick={() => {
              setIsImageLoaded(false);
              onPreviousImage();
            }}
            size="md"
            icon={<PrevIcon />}
            disabled={isFirstItem}
          />
          <Button
            onClick={() => {
              setIsImageLoaded(false);
              onNextImage();
            }}
            size="md"
            icon={<NextIcon />}
            disabled={isLastItem || !isImageLoaded}
          />
        </div>
      </div>
    </div>
  );
}

export default LargePreview;

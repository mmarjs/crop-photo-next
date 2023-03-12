import React from "react";
import { Image as AntImage, ImageProps as AntImageProps } from "antd";

/**
 *
 */
export type ImageProps = {
  /**
   * relative path of image file.
   */
  src?: string;

  //classname of wrapper div
  className?: string;

  /**
   * whether the image will be previewable
   */
  preview?: boolean;

  /**
   * onClick function of it
   */
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;

  /**
   * onError function of image.
   */
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
};

/**
 *
 * @param param0
 * @returns
 */
export function Image({ src, className, preview = false, onClick, onError }: ImageProps) {
  return <AntImage src={src} wrapperClassName={className} preview={preview} onClick={onClick} onError={onError} />;
}

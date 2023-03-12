import { CropAroundConfig } from "../models/CropAroundConfig";
import { CropFromConfig } from "../models/CropFromConfig";
import { MarkerData } from "../models/MarkerData";
import { RectangleShape } from "../models/RectangleShape";
import { CropSide, CropType, FaceMarkerType, UnitType } from "../ui-components/enums";
import { PropertyUtil } from "../ui-components/utils";

/**
 *
 */
export class SmartCropUtil {
  private cropType: CropType = CropType.FROM;
  private cropConfig: Object;
  private mediaWidth: number;
  private mediaHeight: number;
  private markerDataList: Array<MarkerData>;

  /**
   *
   * @param cropType
   * @param cropConfig
   * @param mediaWidth
   * @param mediaHeight
   * @param markerDataList
   */
  constructor(
    cropType: CropType,
    cropConfig: Object,
    mediaWidth: number,
    mediaHeight: number,
    markerDataList: Array<MarkerData>
  ) {
    this.cropType = cropType;
    this.cropConfig = cropConfig;
    this.mediaWidth = mediaWidth;
    this.mediaHeight = mediaHeight;
    this.markerDataList = markerDataList;
  }

  /**
   *
   * @returns
   */
  public calculateCropArea(): Array<RectangleShape> {
    switch (this.cropType) {
      case CropType.FROM:
        return this.calculateCropAreaForFrom();
      case CropType.AROUND:
        return this.calculateCropAreaForAround();
    }
  }

  /**
   *
   * @param cropSideValues
   * @param cropSide
   * @param defValue
   * @returns
   */
  private getCropSideValue(cropSideValues: Map<CropSide, number>, cropSide: CropSide, defValue: number = 0): number {
    let value: number | undefined = defValue;
    if (cropSideValues && cropSide && cropSideValues.get(cropSide)) {
      value = cropSideValues.get(cropSide);
      if (!value) value = defValue;
    }
    return value;
  }

  /**
   *
   * @param leftX
   * @param rightX
   * @param topY
   * @param bottomY
   * @param markerData
   */
  public giveCropSideValuesFromDrag(
    leftX: number,
    rightX: number,
    topY: number,
    bottomY: number,
    markerData: MarkerData
  ): Map<CropSide, number> {
    /*let topValue = topY;
    let bottomValue = this.mediaHeight - bottomY;
    let leftValue = leftX;
    let rightValue = this.mediaWidth - rightX;

    let leftMargin = markerData.getX();
    let rightMargin = this.mediaWidth - (markerData.getX() + markerData.getWidth());
    let topMargin = markerData.getY();
    let bottomMargin = this.mediaHeight - (markerData.getY() + markerData.getHeight());

    if (this.cropType == CropType.FROM) {
      let cropFromConfig = this.cropConfig as CropFromConfig;
      switch (cropFromConfig.getCropSide()) {
        case CropSide.TOP:
          topMargin = cropFromConfig.isIncludeMarkersBoundary() ? topMargin + markerData.getHeight() : topMargin;
          bottomMargin = topMargin;
          break;
        case CropSide.BOTTOM:
          bottomMargin = cropFromConfig.isIncludeMarkersBoundary() ? bottomMargin + markerData.getHeight() : bottomMargin;
          topMargin = bottomMargin;
          break;
        case CropSide.LEFT:
          leftMargin = cropFromConfig.isIncludeMarkersBoundary() ? leftMargin + markerData.getWidth() : leftMargin;
          rightMargin = leftMargin;
          break;
        case CropSide.RIGHT:
          rightMargin = cropFromConfig.isIncludeMarkersBoundary() ? rightMargin + markerData.getWidth() : rightMargin;
          leftMargin = rightMargin;
          break;
      }
    }*/
    let markerDataPX = this.convertMarkerDataIntoPixels(markerData, this.mediaHeight, this.mediaWidth);
    let cropSideValues = new Map<CropSide, number>();
    cropSideValues.set(CropSide.TOP, this.giveCropSideTopValueForMarker(topY, markerDataPX));
    cropSideValues.set(CropSide.BOTTOM, this.giveCropSideBottomValueForMarker(bottomY, markerDataPX));
    cropSideValues.set(CropSide.LEFT, this.giveCropSideLeftValueForMarker(leftX, markerDataPX));
    cropSideValues.set(CropSide.RIGHT, this.giveCropSideRightValueForMarker(rightX, markerDataPX));
    return cropSideValues;
  }

  /**
   *
   * @param leftX
   * @param markerData
   * @returns
   */
  public giveCropSideLeftValueForMarker(leftX: number, markerData: MarkerData): number {
    let leftOffset = leftX;
    let leftMargin = markerData.getX();
    let leftMarginReference = this.getLeftReferenceValue(markerData);
    if (this.cropType === CropType.FROM) {
      let cropFromConfig = this.cropConfig as CropFromConfig;
      if (cropFromConfig.getCropSide() === CropSide.RIGHT) {
        let rightMargin = this.mediaWidth - (markerData.getX() + markerData.getWidth());
        leftMargin = cropFromConfig.isIncludeMarkersBoundary() ? rightMargin + markerData.getWidth() : rightMargin;
        leftOffset = leftX - (this.mediaWidth - leftMargin);
      } else if (cropFromConfig.getCropSide() === CropSide.LEFT) {
        leftMargin = cropFromConfig.isIncludeMarkersBoundary() ? leftMargin + markerData.getWidth() : leftMargin;
      }
    }
    return this.cropType === CropType.FROM
      ? 100 - (leftOffset / leftMargin) * 100
      : ((leftMargin - leftOffset) / leftMarginReference) * 100;
  }

  /**
   *
   * @param rightX
   * @param markerData
   * @returns
   */
  public giveCropSideRightValueForMarker(rightX: number, markerData: MarkerData): number {
    let rightOffset = this.mediaWidth - rightX;
    let rightMargin = this.mediaWidth - (markerData.getX() + markerData.getWidth());
    let rightMarginReference = this.getRightReferenceValue(markerData);
    if (this.cropType === CropType.FROM) {
      let cropFromConfig = this.cropConfig as CropFromConfig;
      if (cropFromConfig.getCropSide() === CropSide.LEFT) {
        let leftMargin = markerData.getX();
        rightMargin = cropFromConfig.isIncludeMarkersBoundary() ? leftMargin + markerData.getWidth() : leftMargin;
        rightOffset = rightMargin - rightX;
      } else if (cropFromConfig.getCropSide() === CropSide.RIGHT) {
        rightMargin = cropFromConfig.isIncludeMarkersBoundary() ? rightMargin + markerData.getWidth() : rightMargin;
      }
    }
    return this.cropType === CropType.FROM
      ? 100 - (rightOffset / rightMargin) * 100
      : ((rightMargin - rightOffset) / rightMarginReference) * 100;
  }

  /**
   *
   * @param topY
   * @param markerData
   * @returns
   */
  public giveCropSideTopValueForMarker(topY: number, markerData: MarkerData): number {
    let topOffset: number = topY;
    let topMargin: number = markerData.getY();
    let topMarginReference: number = this.getTopReferenceValue(markerData);
    if (this.cropType === CropType.FROM) {
      let cropFromConfig = this.cropConfig as CropFromConfig;
      if (cropFromConfig.getCropSide() === CropSide.BOTTOM) {
        let bottomMargin = this.mediaHeight - (markerData.getY() + markerData.getHeight());
        topMargin = cropFromConfig.isIncludeMarkersBoundary() ? bottomMargin + markerData.getHeight() : bottomMargin;
        topOffset = topY - (this.mediaHeight - topMargin);
      } else if (cropFromConfig.getCropSide() === CropSide.TOP) {
        topMargin = cropFromConfig.isIncludeMarkersBoundary() ? topMargin + markerData.getHeight() : topMargin;
      }
    }
    return this.cropType === CropType.FROM
      ? 100 - (topOffset / topMargin) * 100
      : ((topMargin - topOffset) / topMarginReference) * 100;
  }

  /**
   *
   * @param bottomY
   * @param markerData
   * @returns
   */
  public giveCropSideBottomValueForMarker(bottomY: number, markerData: MarkerData): number {
    let bottomOffset = this.mediaHeight - bottomY;
    let bottomMargin = this.mediaHeight - (markerData.getY() + markerData.getHeight());
    let bottomMarginReference = this.getBottomReferenceValue(markerData);
    if (this.cropType === CropType.FROM) {
      let cropFromConfig = this.cropConfig as CropFromConfig;
      if (cropFromConfig.getCropSide() === CropSide.TOP) {
        let topMargin = markerData.getY();
        bottomMargin = cropFromConfig.isIncludeMarkersBoundary() ? topMargin + markerData.getHeight() : topMargin;
        bottomOffset = topMargin - bottomY;
      } else if (cropFromConfig.getCropSide() === CropSide.BOTTOM) {
        bottomMargin = cropFromConfig.isIncludeMarkersBoundary() ? bottomMargin + markerData.getHeight() : bottomMargin;
      }
    }
    return this.cropType === CropType.FROM
      ? 100 - (bottomOffset / bottomMargin) * 100
      : ((bottomMargin - bottomOffset) / bottomMarginReference) * 100;
  }

  /**
   *
   * @param markerData
   * @param mediaHeight
   * @param mediaWidth
   * @returns
   */
  private convertMarkerDataIntoPercentage(markerData: MarkerData, mediaHeight: number, mediaWidth: number) {
    if (markerData.getUnit() === UnitType.PIXELS) {
      return new MarkerData(
        markerData.getX() / mediaWidth,
        markerData.getY() / mediaHeight,
        markerData.getWidth() / mediaWidth,
        markerData.getHeight() / mediaHeight,
        UnitType.PIXELS
      );
    } else {
      return markerData;
    }
  }

  /**
   *
   * @param markerData
   * @param mediaHeight
   * @param mediaWidth
   * @returns
   */
  private convertMarkerDataIntoPixels(markerData: MarkerData, mediaHeight: number, mediaWidth: number) {
    if (markerData.getUnit() === UnitType.PERCENTAGE) {
      return new MarkerData(
        markerData.getX() * mediaWidth,
        markerData.getY() * mediaHeight,
        markerData.getWidth() * mediaWidth,
        markerData.getHeight() * mediaHeight,
        UnitType.PIXELS
      );
    } else {
      return markerData;
    }
  }

  /**
   *
   * @returns
   */
  private calculateCropAreaForFrom(): Array<RectangleShape> {
    let cropAreaList: Array<RectangleShape> = [];
    let cropFromConfig = this.cropConfig as CropFromConfig;

    let cropSideValues = cropFromConfig.getCropSideValues();
    let includeMarkersBoundary =
      "isIncludeMarkersBoundary" in cropFromConfig
        ? (cropFromConfig as CropFromConfig)?.isIncludeMarkersBoundary()
        : false;
    let cropSide = "getCropSide" in cropFromConfig ? cropFromConfig.getCropSide() : undefined;

    this.markerDataList.forEach((location: MarkerData) => {
      if (location && cropFromConfig && cropFromConfig.getCropSideValues()) {
        let markerData = this.convertMarkerDataIntoPixels(location, this.mediaHeight, this.mediaWidth);
        let x = 0.0;
        let y = 0.0;
        let height = this.mediaHeight;
        let width = this.mediaWidth;
        let trimHeightFromTop = 0.0;
        let trimHeightFromBottom = 0.0;
        let trimWidthFromLeft = 0.0;
        let trimWidthFromRight = 0.0;
        switch (cropSide) {
          case CropSide.TOP:
            x = 0;
            y = 0;
            height = includeMarkersBoundary ? markerData.getY() + markerData.getHeight() : markerData.getY();
            trimHeightFromTop =
              this.getCropSideValue(cropSideValues, CropSide.TOP) < 100
                ? height * ((100 - this.getCropSideValue(cropSideValues, CropSide.TOP)) / 100)
                : 0;
            trimHeightFromBottom =
              this.getCropSideValue(cropSideValues, CropSide.BOTTOM) < 100
                ? height * ((100 - this.getCropSideValue(cropSideValues, CropSide.BOTTOM)) / 100)
                : 0;
            trimWidthFromLeft =
              this.getCropSideValue(cropSideValues, CropSide.LEFT) < 100
                ? markerData.getX() * ((100 - this.getCropSideValue(cropSideValues, CropSide.LEFT)) / 100)
                : 0;
            trimWidthFromRight =
              this.getCropSideValue(cropSideValues, CropSide.RIGHT) < 100
                ? (width - markerData.getX() - markerData.getWidth()) *
                  ((100 - this.getCropSideValue(cropSideValues, CropSide.RIGHT)) / 100)
                : 0;
            break;
          case CropSide.RIGHT:
            y = 0;
            x = includeMarkersBoundary ? markerData.getX() : markerData.getX() + markerData.getWidth();
            width = this.mediaWidth - x;
            trimHeightFromTop =
              this.getCropSideValue(cropSideValues, CropSide.TOP) < 100
                ? markerData.getY() * ((100 - this.getCropSideValue(cropSideValues, CropSide.TOP)) / 100)
                : 0;
            trimHeightFromBottom =
              this.getCropSideValue(cropSideValues, CropSide.BOTTOM) < 100
                ? (height - markerData.getY() - markerData.getHeight()) *
                  ((100 - this.getCropSideValue(cropSideValues, CropSide.BOTTOM)) / 100)
                : 0;
            trimWidthFromLeft =
              this.getCropSideValue(cropSideValues, CropSide.LEFT) < 100
                ? width * ((100 - this.getCropSideValue(cropSideValues, CropSide.LEFT)) / 100)
                : 0;
            trimWidthFromRight =
              this.getCropSideValue(cropSideValues, CropSide.RIGHT) < 100
                ? width * ((100 - this.getCropSideValue(cropSideValues, CropSide.RIGHT)) / 100)
                : 0;
            break;
          case CropSide.BOTTOM:
            x = 0;
            y = includeMarkersBoundary ? markerData.getY() : markerData.getY() + markerData.getHeight();
            height = this.mediaHeight - y;
            trimHeightFromTop =
              this.getCropSideValue(cropSideValues, CropSide.TOP) < 100
                ? height * ((100 - this.getCropSideValue(cropSideValues, CropSide.TOP)) / 100)
                : 0;
            trimHeightFromBottom =
              this.getCropSideValue(cropSideValues, CropSide.BOTTOM) < 100
                ? height * ((100 - this.getCropSideValue(cropSideValues, CropSide.BOTTOM)) / 100)
                : 0;
            trimWidthFromLeft =
              this.getCropSideValue(cropSideValues, CropSide.LEFT) < 100
                ? markerData.getX() * ((100 - this.getCropSideValue(cropSideValues, CropSide.LEFT)) / 100)
                : 0;
            trimWidthFromRight =
              this.getCropSideValue(cropSideValues, CropSide.RIGHT) < 100
                ? (width - markerData.getX() - markerData.getWidth()) *
                  ((100 - this.getCropSideValue(cropSideValues, CropSide.RIGHT)) / 100)
                : 0;
            break;
          case CropSide.LEFT:
            x = 0;
            y = 0;
            width = includeMarkersBoundary ? markerData.getX() + markerData.getWidth() : markerData.getX();

            trimHeightFromTop =
              this.getCropSideValue(cropSideValues, CropSide.TOP) < 100
                ? markerData.getY() * ((100 - this.getCropSideValue(cropSideValues, CropSide.TOP)) / 100)
                : 0;
            trimHeightFromBottom =
              this.getCropSideValue(cropSideValues, CropSide.BOTTOM) < 100
                ? (height - markerData.getY() - markerData.getHeight()) *
                  ((100 - this.getCropSideValue(cropSideValues, CropSide.BOTTOM)) / 100)
                : 0;
            trimWidthFromLeft =
              this.getCropSideValue(cropSideValues, CropSide.LEFT) < 100
                ? width * ((100 - this.getCropSideValue(cropSideValues, CropSide.LEFT)) / 100)
                : 0;
            trimWidthFromRight =
              this.getCropSideValue(cropSideValues, CropSide.RIGHT) < 100
                ? width * ((100 - this.getCropSideValue(cropSideValues, CropSide.RIGHT)) / 100)
                : 0;
            break;
        }

        x = trimWidthFromLeft > 0 ? x + trimWidthFromLeft : x;
        y = trimHeightFromTop > 0 ? y + trimHeightFromTop : y;
        height = height - (trimHeightFromTop + trimHeightFromBottom);
        width = width - (trimWidthFromLeft + trimWidthFromRight);

        cropAreaList.push(new RectangleShape(x, y, width, height));
      }
    });
    return cropAreaList;
  }

  private getHeightReferenceValue(): number {
    return this.mediaHeight;
  }

  private getTopReferenceValue(markerData: MarkerData): number {
    return this.getHeightReferenceValue();
  }

  private getBottomReferenceValue(markerData: MarkerData): number {
    return this.getHeightReferenceValue();
  }

  private getWidthReferenceValue(): number {
    return this.mediaWidth;
  }

  private getLeftReferenceValue(markerData: MarkerData): number {
    return this.getWidthReferenceValue();
  }

  private getRightReferenceValue(markerData: MarkerData): number {
    return this.getWidthReferenceValue();
  }

  private calculateTopLength(topCropValue: number, markerData: MarkerData): number {
    let maxTopMargin: number = markerData.getY();
    let topMarginReference: number = this.getTopReferenceValue(markerData);
    const cropHeightFromTop: number = topCropValue > 0 ? topMarginReference * (topCropValue / 100) : 0;
    return Math.min(cropHeightFromTop, maxTopMargin);
  }

  private calculateBottomLength(bottomCropValue: number, markerData: MarkerData): number {
    let maxBottomMargin: number = this.mediaHeight - markerData.getY() - markerData.getHeight();
    let bottomMarginReference: number = this.getBottomReferenceValue(markerData);
    const cropHeightFromBottom = bottomCropValue > 0 ? bottomMarginReference * (bottomCropValue / 100) : 0;
    return Math.min(cropHeightFromBottom, maxBottomMargin);
  }

  private calculateLeftLength(leftCropValue: number, markerData: MarkerData): number {
    let maxLeftMargin: number = markerData.getX();
    let leftMarginReference: number = this.getLeftReferenceValue(markerData);
    const cropWidthFromLeft = leftCropValue > 0 ? leftMarginReference * (leftCropValue / 100) : 0;
    return Math.min(cropWidthFromLeft, maxLeftMargin);
  }

  private calculateRightLength(rightCropValue: number, markerData: MarkerData): number {
    let maxRightMargin: number = this.mediaWidth - markerData.getX() - markerData.getWidth();
    let rightMarginReference: number = this.getRightReferenceValue(markerData);
    const cropWidthFromRight = rightCropValue > 0 ? rightMarginReference * (rightCropValue / 100) : 0;
    return Math.min(cropWidthFromRight, maxRightMargin);
  }

  /**
   *
   * @returns
   */
  private calculateCropAreaForAround(): Array<RectangleShape> {
    let cropAreaList: Array<RectangleShape> = [];
    let cropAroundConfig = this.cropConfig as CropAroundConfig;
    let cropSideValues = cropAroundConfig.getCropSideValues();

    this.markerDataList.forEach((location: MarkerData) => {
      let markerData = this.convertMarkerDataIntoPixels(location, this.mediaHeight, this.mediaWidth);
      let x = 0.0;
      let y = 0.0;

      //Todo: use positionX and positionY based on their significant usage in centerX and centerY or x and y.
      //let centerX = markerData.getX() + (markerData.getWidth() / 2) + positionXPercentage;
      //let centerY = markerData.getY() + (markerData.getHeight() / 2) + positionYPercentage;
      let leftWidth = markerData.getX();
      let rightWidth = this.mediaWidth - markerData.getX() - markerData.getWidth();
      let topHeight = markerData.getY();
      let bottomHeight = this.mediaHeight - markerData.getY() - markerData.getHeight();

      const trimHeightFromTop =
        topHeight - this.calculateTopLength(this.getCropSideValue(cropSideValues, CropSide.TOP), markerData);
      const trimHeightFromBottom =
        bottomHeight - this.calculateBottomLength(this.getCropSideValue(cropSideValues, CropSide.BOTTOM), markerData);
      const trimWidthFromLeft =
        leftWidth - this.calculateLeftLength(this.getCropSideValue(cropSideValues, CropSide.LEFT), markerData);
      const trimWidthFromRight =
        rightWidth - this.calculateRightLength(this.getCropSideValue(cropSideValues, CropSide.RIGHT), markerData);

      x = trimWidthFromLeft > 0 && trimWidthFromLeft <= leftWidth ? x + trimWidthFromLeft : x;
      y = trimHeightFromTop > 0 && trimHeightFromTop <= topHeight ? y + trimHeightFromTop : y;
      let height = topHeight - trimHeightFromTop + markerData.getHeight() + (bottomHeight - trimHeightFromBottom);
      let width = leftWidth - trimWidthFromLeft + markerData.getWidth() + (rightWidth - trimWidthFromRight);

      cropAreaList.push(new RectangleShape(x, y, width, height));
    });
    return cropAreaList;
  }
}

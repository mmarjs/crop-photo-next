import { CropSide, CropSideUtil } from "../ui-components/enums";
import { PropertyUtil } from "../ui-components/utils";

export class CropFromConfig {
  private includeMarkersBoundary: boolean = false;
  private cropSideValues: Map<CropSide, number> = new Map<CropSide, number>();
  private cropSide: CropSide = CropSide.TOP;

  constructor(includeMarkersBoundary: boolean, cropSideValues: Map<CropSide, number>, cropSide: string | CropSide) {
    this.includeMarkersBoundary = includeMarkersBoundary;
    this.setCropSideValuesFromObject(cropSideValues);
    this.setCropSideFromObject(cropSide);
  }

  private setCropSideFromObject(cropSide: any): void {
    if (PropertyUtil.isStringType(cropSide)) this.cropSide = CropSideUtil.parse(cropSide);
    else if (Object.values(CropSide).includes(cropSide)) this.cropSide = cropSide;
    else this.cropSide = CropSide.TOP;
  }

  private setCropSideValuesFromObject(cropSideValues: any): void {
    this.cropSideValues.set(CropSide.TOP, cropSideValues && cropSideValues.top ? cropSideValues.top : 100);
    this.cropSideValues.set(CropSide.BOTTOM, cropSideValues && cropSideValues.bottom ? cropSideValues.bottom : 100);
    this.cropSideValues.set(CropSide.LEFT, cropSideValues && cropSideValues.left ? cropSideValues.left : 100);
    this.cropSideValues.set(CropSide.RIGHT, cropSideValues && cropSideValues.right ? cropSideValues.right : 100);
  }

  public getCropSideValues(): Map<CropSide, number> {
    return this.cropSideValues;
  }

  public setCropSideValues(cropSideValues: Map<CropSide, number>): void {
    this.cropSideValues = cropSideValues;
  }

  public isIncludeMarkersBoundary(): boolean {
    return this.includeMarkersBoundary;
  }

  public setIncludeMarkersBoundary(includeMarkersBoundary: boolean): void {
    this.includeMarkersBoundary = includeMarkersBoundary;
  }

  public getCropSide(): CropSide {
    return this.cropSide;
  }

  public setCropSide(cropSide: CropSide): void {
    this.cropSide = cropSide;
  }
}

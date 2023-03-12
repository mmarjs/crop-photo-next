import { CropSide } from "../ui-components/enums";

export class CropAroundConfig {
  private positionX: number = 0.0;
  private positionY: number = 0.0;
  private cropSideValues: Map<CropSide, number> = new Map<CropSide, number>();

  constructor(positionX: number, positionY: number, cropSideValues: any) {
    this.positionX = positionX;
    this.positionY = positionY;
    this.setCropSideValuesFromObject(cropSideValues);
  }

  private setCropSideValuesFromObject(cropSideValues: any): void {
    this.cropSideValues.set(CropSide.TOP, cropSideValues && cropSideValues.top ? cropSideValues.top : 100);
    this.cropSideValues.set(CropSide.BOTTOM, cropSideValues && cropSideValues.bottom ? cropSideValues.bottom : 100);
    this.cropSideValues.set(CropSide.LEFT, cropSideValues && cropSideValues.left ? cropSideValues.left : 100);
    this.cropSideValues.set(CropSide.RIGHT, cropSideValues && cropSideValues.right ? cropSideValues.right : 100);
  }

  public getPositionX(): number {
    return this.positionX;
  }

  public setPositionX(positionX: number): void {
    this.positionX = positionX;
  }

  public getPositionY(): number {
    return this.positionY;
  }

  public setPositionY(positionY: number): void {
    this.positionY = positionY;
  }

  public getCropSideValues(): Map<CropSide, number> {
    return this.cropSideValues;
  }

  public setCropSideValues(cropSide: Map<CropSide, number>): void {
    this.cropSideValues = cropSide;
  }
}

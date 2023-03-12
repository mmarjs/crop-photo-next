import { UnitType } from "../ui-components/enums";
import { RectangleShape } from "./RectangleShape";

export class MarkerData extends RectangleShape {
  private unit: UnitType;

  constructor(x: number, y: number, width: number, height: number, unit: UnitType) {
    super(x, y, width, height);
    this.unit = unit;
  }

  public getUnit(): UnitType {
    return this.unit;
  }

  public setUnit(unit: UnitType): MarkerData {
    this.unit = unit;
    return this;
  }
}

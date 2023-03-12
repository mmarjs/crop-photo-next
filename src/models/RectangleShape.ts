import { JSON_TYPE } from "../common/Types";

export class RectangleShape {
  private x: number;
  private y: number;
  private width: number;
  private height: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  public getX(): number {
    return this.x;
  }

  public getY(): number {
    return this.y;
  }

  public getWidth(): number {
    return this.width;
  }

  public getHeight(): number {
    return this.height;
  }

  public setX(x: number): RectangleShape {
    this.x = x;
    return this;
  }

  public setY(y: number): RectangleShape {
    this.y = y;
    return this;
  }

  public setWidth(width: number): RectangleShape {
    this.width = width;
    return this;
  }

  public setHeight(height: number): RectangleShape {
    this.height = height;
    return this;
  }

  public static toRectangleShape(data: JSON_TYPE): RectangleShape {
    return new RectangleShape(data["x"], data["y"], data["width"], data["height"]);
  }
}

import { JSON_TYPE } from "../common/Types";

export default class MediaSize {
  constructor(private _width: number, private _height: number) {}

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  toString() {
    return this.width + "x" + this.height;
  }

  public toJson() {
    return { width: this._width, height: this._height };
  }

  public static fromJson(d: JSON_TYPE): MediaSize {
    let w: number = 0;
    let h: number = 0;
    if (d) {
      w = d["width"] || 0;
      h = d["height"] || 0;
    }
    return new MediaSize(w, h);
  }
}

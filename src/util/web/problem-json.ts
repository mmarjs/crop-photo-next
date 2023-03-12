import {t} from "i18next";
import {JSON_TYPE} from "../../common/Types";

export default class ProblemJson {
  private readonly _detail: string;
  private readonly _status: number;
  private readonly _title: string;
  private readonly _type: string;
  private readonly _extensions: JSON_TYPE;

  constructor(detail: string, status: number, title: string, type: string, params: JSON_TYPE) {
    this._detail = detail;
    this._status = status;
    this._title = title;
    this._type = type;
    this._extensions = params;
  }

  get detail(): string {
    return this._detail;
  }

  get status(): number {
    return this._status;
  }

  get title(): string {
    return this._title;
  }

  get type(): string {
    return this._type;
  }

  get extensions(): JSON_TYPE {
    return this._extensions ? this._extensions : {};
  }

  getExtension(key: string): string | number {
    return this.extensions[key];
  }

  static toProblemJson(object: { [key: string]: any } | undefined | null): ProblemJson {
    let detail: string, status: number, title: string, type: string;
    let extensions: JSON_TYPE;
    if (object) {
      detail = object.detail;
      status = object.status;
      title = object.title;
      type = object.type;
      extensions = object.extensions;
      return new ProblemJson(detail, status, title, type, extensions);
    }
    return new ProblemJson(
      t("UNKNOWN_ERROR_DETAILS"),
      500,
      t("UNKNOWN_ERROR_TITLE"),
      "/exception/server_error/internal_server_error",
      {}
    );
  }
}

export { ProblemJson };

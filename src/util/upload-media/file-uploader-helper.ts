import { CognitoUserSession } from "amazon-cognito-identity-js";
import { UploadItem } from "../../common/Classes";
import { UploadReporter } from "../../controller/UploadReporter";

/**
 * FileUploaderData Class
 */
export class FileUploaderData {
  private readonly _automationId: string;
  private readonly _selectedFiles: UploadItem[];
  private readonly _uploadReporter: UploadReporter;

  constructor(automationId: string, selectedFiles: UploadItem[], uploadReporter: UploadReporter) {
    this._automationId = automationId;
    this._selectedFiles = selectedFiles;
    this._uploadReporter = uploadReporter;
  }

  get automationId(): string {
    return this._automationId;
  }

  private _evaporateObj: unknown;

  public get evaporateObj() {
    return this._evaporateObj;
  }

  public set evaporateObj(value) {
    this._evaporateObj = value;
  }

  public get uploadReporter(): UploadReporter {
    return this._uploadReporter;
  }

  get selectedFiles(): UploadItem[] {
    return this._selectedFiles;
  }
}

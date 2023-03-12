import { UploadItem } from "../common/Classes";
import { UploadAssetDataFromAPI, UploadFinishAPIResponse } from "../common/Types";
import { ActiveUpload, CancelableUpload } from "../util/upload-media/single-file-uploader";

export interface UploadReporter {
  onNewFilesAdded(isSearchData?: boolean, uploadItemList?: UploadItem[]): void;

  onUploadStart(item: UploadItem, item2: UploadAssetDataFromAPI, cancelable: ActiveUpload): void;

  onProgress(item: UploadItem, progressValue: number, bytesTransferred: number, total: number): void;

  onUploadFinish(item: UploadItem, item2: UploadAssetDataFromAPI, response: UploadFinishAPIResponse): void;

  onAllTheUploadFinished(): void;

  onDelete(): void;

  onUploadCancel(item: UploadItem): void;

  onError(item: UploadItem, error: any): void;
}

export class UploadReporterAdapter implements UploadReporter {
  onAllTheUploadFinished(): void {}

  onDelete(): void {}

  onError(item: UploadItem, error: any): void {}

  onNewFilesAdded(isSearchData?: boolean): void {}

  onProgress(item: UploadItem, progressValue: number, bytesTransferred: number, total: number): void {}

  onUploadCancel(item: UploadItem): void {}

  onUploadFinish(item: UploadItem, item2: UploadAssetDataFromAPI, response: UploadFinishAPIResponse): void {}

  onUploadStart(item: UploadItem, item2: UploadAssetDataFromAPI, cancelable: ActiveUpload): void {}
}

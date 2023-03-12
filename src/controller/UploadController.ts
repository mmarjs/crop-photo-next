import { UploadAWSConfig, UploadItem } from "../common/Classes";
import { UPLOAD_STATUS } from "../common/Enums";
import { UploadReporter } from "./UploadReporter";
import { AssetData, UploadAssetDataFromAPI, UploadFinishAPIResponse } from "../common/Types";
import {
  ACCEPTED_EXTENSIONS_FOR_UPLOAD,
  ACCEPTED_FILE_SIZE,
  DEFAULT_PAGE_SIZE,
  MAX_CONCURRENT_COUNT
} from "../ui-components/utils/Constants";
import { fileUploader } from "../util/upload-media/file-uploader";
import { FileUploaderData } from "../util/upload-media/file-uploader-helper";
import { Logger } from "aws-amplify";
import { ActiveUpload } from "../util/upload-media/single-file-uploader";
import _ from "lodash";
import AssetsView from "./AssetsView";
import Optional from "../util/Optional";

export class UploadController implements UploadReporter, AssetsView {
  protected readonly logger = new Logger("util:upload-media:UploadController");
  private readonly nextItemsUploader: NextItemsUploader;
  private queue: Array<UploadItem> = [];
  private activeUploads: Map<string, ActiveUpload> = new Map();
  private uploadIdToLastNotifiedProgressPercentage: Map<string, number> = new Map();
  private finishedUploads: Set<string> = new Set<string>();
  private failedUploads: Set<string> = new Set<string>();
  private readonly reporter: UploadReporter;
  private evaporateObject: unknown = null;
  private automationId: string = "";
  private awsConfig: UploadAWSConfig | null = null;
  private searchText: string = "";
  private totalBytes: number = 0;

  //private bytesTransferred: number = 0;

  constructor(reporter: UploadReporter) {
    this.reporter = reporter;
    this.nextItemsUploader = new NextItemsUploader(this);
  }

  public canStartUpload(uiId: string): boolean {
    if (!this.finishedUploads.has(uiId)) {
      //Not in finished uploads.
      if (!this.activeUploads.has(uiId)) {
        //Not in active uploads.
        return true;
      }
    }
    return false;
  }

  public getActiveUploads() {
    return this.activeUploads;
  }

  public setAutomationId(automation_id: string) {
    this.automationId = automation_id;
  }

  public getFiles(): Array<UploadItem> {
    return this.queue;
  }

  /*  public setAwsConfig(awsConfig: UploadAWSConfig) {
    this.awsConfig = awsConfig;
  }*/

  public isRunning(): boolean {
    return (
      /* this.activeUploads.size > 0 */ this.getFiles().length > 0 && this.finishedUploads.size < this.getFiles().length
    );
  }

  public static convertAssetDataListToUploadItems(assetDataList: AssetData[]): UploadItem[] {
    const uploadItems: UploadItem[] = [];
    this.mapAssetDataToUploadItem(assetDataList, item => uploadItems.push(item));
    return uploadItems;
  }

  public static mapAssetDataToUploadItem(assetDataList: AssetData[], callback: (uploadItem: UploadItem) => void) {
    if (assetDataList && assetDataList.length > 0) {
      for (const assetData of assetDataList) {
        let uploadItem = this.convertAssetDataToUploadItem(assetData);
        callback(uploadItem);
      }
    }
  }

  private static convertAssetDataToUploadItem(assetData: AssetData) {
    let uploadItem = new UploadItem(null, assetData.name);
    uploadItem.setId(assetData.id);
    uploadItem.setStatus(UPLOAD_STATUS.FINISHED);
    uploadItem.setThumbnailUrl(assetData.thumb_url);
    uploadItem.setThumbGenerated(assetData.thumb_generated);
    uploadItem.setPreviewGenerated(assetData.preview_generated);
    uploadItem.setSize(assetData.size);
    return uploadItem;
  }

  public static isAcceptedUpload(file: File) {
    const fileExtension = file.name.split(".").pop()?.toLocaleLowerCase();
    const fileSize = file.size;
    return !!(
      fileExtension &&
      fileExtension !== "" &&
      ACCEPTED_EXTENSIONS_FOR_UPLOAD.includes(fileExtension) &&
      fileSize < ACCEPTED_FILE_SIZE
    );
  }

  /**
   * Method called when files are dropped from the UI or user choose to upload.
   * @param files
   */
  onFilesDrop(files: Array<File>) {
    let totalBytes = 0;
    files.forEach(file => {
      if (UploadController.isAcceptedUpload(file)) {
        this.queue.push(new UploadItem(file));
        totalBytes += file.size;
      }
    });
    this.totalBytes = totalBytes;
    this.notify();
  }

  getFinishedCount() {
    return this.finishedUploads.size;
  }

  getTotal() {
    return this.queue.length;
  }

  reset() {
    this.finishedUploads.clear();
    this.activeUploads.clear();
    this.queue = [];
    this.failedUploads.clear();
    this.uploadIdToLastNotifiedProgressPercentage.clear();
  }

  public start() {
    if (this.isAllUploadsDone()) {
      this.onAllTheUploadFinished();
    } else {
      this.nextItemsUploader.uploadNext();
    }
  }

  public callForUpload(selectedFiles: UploadItem[]): Promise<Map<string, ActiveUpload>> {
    let fileUploaderData = new FileUploaderData(this.automationId, selectedFiles, this);
    fileUploaderData.evaporateObj = this.evaporateObject;
    return fileUploader(fileUploaderData);
  }

  private notify() {
    this.reporter.onNewFilesAdded();
    this.start();
  }

  onAllTheUploadFinished(): void {
    this.reset();
    this.reporter.onAllTheUploadFinished();
  }

  onDelete(): void {
    this.reporter.onDelete();
  }

  onError(item: UploadItem, error: any): void {
    this.activeUploads.delete(item.getUiId());
    this.failedUploads.add(item.getUiId());
    this.reporter.onError(item, error);
  }

  onNewFilesAdded(isSearchData?: boolean): void {
    this.reporter.onNewFilesAdded(isSearchData);
  }

  onProgress(item: UploadItem, progressValue: number, bytesTransferred: number, total: number): void {
    let lastPercentage = this.uploadIdToLastNotifiedProgressPercentage.get(item.getUiId());
    if (_.isUndefined(lastPercentage)) {
      lastPercentage = 0;
    }
    if (progressValue - lastPercentage >= 1) {
      this.reporter.onProgress(item, progressValue, bytesTransferred, total);
      this.uploadIdToLastNotifiedProgressPercentage.set(item.getUiId(), progressValue);
      //this.logger.debug(`Reporter progress: ${item.getName()} -> ${progressValue}.}`);
    }
  }

  onUploadCancel(item: UploadItem): void {
    this.logger.debug(`isFinished=${this.activeUploads.get(item.getUiId())?.isFinished()} for name=>${item.getName()}`);
    if (!this.activeUploads.get(item.getUiId())?.isFinished()) {
      this.logger.debug(`set status cancelled for name=>${item.getName()}`);
      item.setStatus(UPLOAD_STATUS.CANCELLED);
    }
    this.activeUploads.delete(item.getUiId());
  }

  onUploadFinish(item: UploadItem, item2: UploadAssetDataFromAPI, response: UploadFinishAPIResponse): void {
    this.logger.debug(`Upload finished for item: item: ${item.getName()}. Removed from active queue`);
    this.activeUploads.delete(item.getUiId());
    this.finishedUploads.add(item.getUiId());
    this.start();
    this.reporter.onUploadFinish(item, item2, response);
  }

  onUploadStart(item: UploadItem, item2: UploadAssetDataFromAPI, cancelable: ActiveUpload): void {
    this.reporter.onUploadStart(item, item2, cancelable);
  }

  /**
   * Do not call this method directly.
   * It has been made public just to perform the unit test.
   * Call the delete method with all.
   */
  cancelUploads(isResetRequired: boolean = true) {
    return new Promise((resolve, reject) => {
      this.logger.debug("Active upload count:", this.activeUploads.size);
      this.activeUploads.forEach((value, key, map) => {
        this.logger.debug("Cancelling upload: ", key, value);
        this.cancel(value, key).finally(_.noop);
        resolve(null);
      });
      this.reset();
      if (isResetRequired) this.onAllTheUploadFinished();
    });
  }

  /**
   * Method calls the cancel promise on the given active upload.
   * @param value{ActiveUpload} Active upload instance which you want to cancel.
   * @param itemUiId Item's UiID, just for logging.
   * @private
   */
  private cancel(value: ActiveUpload, itemUiId: string) {
    return value
      .cancelPromise()
      .finally(() => {
        this.logger.debug("Cancelled upload: ", itemUiId);
      })
      .catch(reason => {
        this.logger.debug("Cancelled upload: ", itemUiId, reason);
      });
  }

  delete(imageIds: string[], selectAll: boolean, ignoredForDelete: string[], isResetRequired: boolean = true): void {
    const cancelUploadAndRemoveFromActiveQueue = (uploadItem: UploadItem) => {
      const activeUpload = this.activeUploads.get(uploadItem.getUiId());
      if (activeUpload) {
        this.cancel(activeUpload, uploadItem.getUiId()).finally(_.noop);
        this.activeUploads.delete(uploadItem.getUiId());
      }
      this.remove(uploadItem);
    };
    //Method only gets the image ids.
    if (selectAll) {
      if (_.isEmpty(ignoredForDelete)) {
        this.cancelUploads(isResetRequired).finally(_.noop);
      } else {
        let itemsToIgnore = this.findItemsByUiId(ignoredForDelete);
        let items2delete = this.queue.filter(item => {
          return !itemsToIgnore.indexOf(item);
        });
        items2delete.forEach(cancelUploadAndRemoveFromActiveQueue);
      }
    } else {
      this.logger.debug("Delete request for ", imageIds);
      const uploadItems = this.findItemsByUiId(imageIds);
      this.logger.debug(`Found: ${uploadItems.length} upload items for deletion`);
      if (uploadItems) {
        uploadItems.forEach(cancelUploadAndRemoveFromActiveQueue);
      }
    }

    //Trigger a onDelete event. SO, that listeners are notified.
    this.onDelete();
  }

  private remove(uploadItem: UploadItem) {
    _.remove(this.queue, uploadItem);
    if (this.isAllUploadsDone()) {
      //Cancel all uploads reset the internal arrays and trigger the upload finish event.
      this.cancelUploads().then(_.noop);
    } else {
      //If some items are pending, this will trigger the start of next upload.
      this.start();
    }
  }

  /**
   * Uploaded has no paging. SO just returning an empty Promise.
   */
  loadNextPage(): Promise<unknown> {
    return Promise.resolve(undefined);
  }

  search(searchText: string): boolean {
    this.logger.debug("Searching in the uploaded items: Search text:", searchText);
    return false;
  }

  /**
   * Check if finished upload size is same as queue length or if the queue.length is zero.
   * @private
   */
  private isAllUploadsDone() {
    return this.finishedUploads.size == this.queue.length || this.queue.length == 0;
  }

  private findItemById(imageId: string): Optional<UploadItem> {
    return Optional.ofNullable(this.queue.find((uploadItem: UploadItem) => imageId == uploadItem.getUiId()));
  }

  private findItemsByUiId(imageIds: string[]) {
    return this.queue.filter((uploadItem: UploadItem) => imageIds.indexOf(uploadItem.getUiId()) !== -1);
  }
}

class NextItemsUploader {
  private _busy: boolean = false; //True is next item upload is busy in choosing the slots.
  private readonly _controller: UploadController;
  private readonly logger: Logger = new Logger("util.upload-media.NextItemsUploader");

  constructor(controller: UploadController) {
    this._controller = controller;
  }

  public canUploadNext() {
    if (!this._busy) {
      if (this.availableSlots() > 0) {
        return true;
      }
    }
    return false;
  }

  public uploadNext() {
    this.logger.debug("In uploadNext()");
    if (this.canUploadNext()) {
      this.logger.debug("In uploadNext -> canUploadNext is true");
      let availableSlots = this.availableSlots();
      this.logger.debug(`In uploadNext -> availableSlots: ${availableSlots}`);
      const items: UploadItem[] = [];
      for (let i = 0; i < this._controller.getFiles().length; i++) {
        let uploadItem = this._controller.getFiles()[i];
        const uiId = uploadItem.getUiId();
        if (this._controller.canStartUpload(uiId)) {
          items.push(uploadItem);
          availableSlots--;
        }
        if (availableSlots == 0) {
          break;
        }
      }
      if (items.length > 0) {
        this.logger.debug("In uploadNext -> chosen items: ", items);
        this.upload(items);
      }
    }
  }

  private availableSlots() {
    return MAX_CONCURRENT_COUNT - this._controller.getActiveUploads().size;
  }

  private upload(items: UploadItem[]) {
    this._busy = true;
    this._controller
      .callForUpload(items)
      .then(this.onUploadSubmission)
      .catch(this.onErrorInUploadSubmission)
      .finally(() => {
        this._busy = false;
      });
  }

  private onUploadSubmission = (submittedUploads: Map<string, ActiveUpload>) => {
    submittedUploads.forEach((value, key) => {
      this._controller.getActiveUploads().set(key, value);
    });
    this.logger.debug(`In onUploadSubmission -> ${submittedUploads.size} submitted.`);
    this._busy = false;
    this.uploadNext();
  };

  private onErrorInUploadSubmission = (error: any) => {
    this.logger.error(error);
    this._busy = false;
    this.uploadNext();
  };
}

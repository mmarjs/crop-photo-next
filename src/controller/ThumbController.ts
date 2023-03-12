import {Logger} from "aws-amplify";
import {UploadItem} from "../common/Classes";
import {AssetData, MediaGenerationStatus} from "../common/Types";
import {INTERVAL_FOR_THUMB_CHECK, MAX_RETRY_FOR_THUMB_CHECK} from "../ui-components/utils/Constants";
import API from "../util/web/api";
import AssetState from "./AssetState";
import {ThumbReporter} from "./ThumbReporter";
import _ from "lodash";

export class ThumbController implements AssetState {
  protected readonly logger = new Logger("controller:ThumbController");
  private readonly reporter: ThumbReporter;
  private assetIdToUploadItemMap: Map<string, ItemForThumbCheck> = new Map();
  private timer: any = null;
  private _paused: boolean = false;
  private _running: boolean = false;
  private _triggerFinishEventOnce: boolean = false;

  constructor(reporter: ThumbReporter) {
    this.reporter = reporter;
  }

  private performRefresh = () => {
    //Clearing previous timer. In case someone calls  the start timer twice.
    clearInterval(this.timer);
    if (!this._paused) {
      this.logger.debug("[performRefresh] timer not paused.");
      this.checkForThumbStatus();
    }
  };

  private clearTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.logger.debug("timer cleared", this.timer);
      this.timer = null;
    }
  }

  private findAssetsForThumbGeneration(): Promise<Array<number>> {
    return new Promise(resolve => {
      let assetIdList: Array<number> = [];
      this.assetIdToUploadItemMap.forEach((value: ItemForThumbCheck, key: string) => {
        if (
          value.getThumbGenerationStatus() === MediaGenerationStatus.PENDING &&
          value.retries < MAX_RETRY_FOR_THUMB_CHECK
        ) {
          this.logger.debug(
            `thumb generation check retry count for id: ${value.uploadItem.getId()} and rerty count: ${value.retries}`
          );
          assetIdList.push(parseInt(key));
          value.incrementRetries();
        } else {
          this.logger.debug(
            `thumb generation check asset is removed from check list because of retry count: ${
              value.retries
            } and thumb status:${value.getThumbGenerationStatus()}`
          );
          this.assetIdToUploadItemMap.delete(key);
        }
      });
      this.logger.debug(`[checkForThumbStatus] Items for which thumb is not generated: ${assetIdList.length}`);
      resolve(assetIdList);
    });
  }

  private fetchThumbGenerationStatusFromBackend(assetIdList: Array<number>): Promise<AssetData[]> {
    return new Promise<AssetData[]>((resolve, reject) => {
      this.logger.debug(`[fetchThumbGenerationStatusFromBackend] Fetching asset thumb status from backend: ${_.size(assetIdList)}`);
      if (assetIdList.length > 0) {
        API.getAssetList(assetIdList).then(
          response => {
            this.logger.debug(`[fetchThumbGenerationStatusFromBackend] received thumb status response from server.`);
            let assetList: AssetData[] = response.data.entries;
            resolve(assetList);
          },
          error => {
            this.logger.error("[fetchThumbGenerationStatusFromBackend] Some exception on getting asset list from server ", error);
            resolve([]);
          }
        );
      } else {
        this.logger.debug("[fetchThumbGenerationStatusFromBackend] No eligible asset for which thumb status needs to be fetched.");
        resolve([]);
      }
    });
  }

  private checkThumbStatusReceivedFromBackend(assetData: Array<AssetData>): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      let anyAssetsThumbStatusChanges: boolean = false;
      assetData.forEach((asset: AssetData) => {
        this.checkAndSetThumbStatus(asset);
        if (asset.thumb_generated != MediaGenerationStatus.PENDING) {
          anyAssetsThumbStatusChanges = true;
        }
      });
      resolve(anyAssetsThumbStatusChanges);
    });
  }

  private checkForThumbStatus() {
    this.logger.debug("[checkForThumbStatus] in.");
    if (!this._running) {
      this.logger.debug("[checkForThumbStatus] refresh not running.");
      this._running = true;
      this.findAssetsForThumbGeneration()
        .then((value: Array<number>) => this.fetchThumbGenerationStatusFromBackend(value))
        .then((value: AssetData[]) => this.checkThumbStatusReceivedFromBackend(value))
        .then((anyAssetsThumbStatusChanges: boolean) => {
          this.logger.debug("Some assets thumb status changed", anyAssetsThumbStatusChanges);
          if (anyAssetsThumbStatusChanges || !this._triggerFinishEventOnce) {
            this.onChange();
            this._triggerFinishEventOnce = true;
          }
          if (this.assetIdToUploadItemMap.size > 0) {
            this.scheduleNextRefresh();
          }
        })
        .finally(() => {
          this._running = false;
        });
    }
    return false;
  }

  private checkAndSetThumbStatus(asset: AssetData) {
    if (asset && asset.thumb_generated) {
      let itemForThumbCheck: ItemForThumbCheck | undefined = this.assetIdToUploadItemMap.get(asset.id.toString());
      if (itemForThumbCheck) {
        itemForThumbCheck.setThumbnailGenerated(asset.thumb_generated);
        if (!_.isUndefined(asset.thumb_generated)) {
          itemForThumbCheck.setThumbnailGenerated(asset.thumb_generated);
          this.logger.debug(
            `Thumb status for id: ${itemForThumbCheck.uploadItem.getId()} name: ${itemForThumbCheck.uploadItem.getName()} -> ${itemForThumbCheck.getThumbGenerationStatus()}`
          );
          //this.assetIdToUploadItemForChangedStatus.set(itemForThumbCheck.getId(), itemForThumbCheck);
        }
      }
    }
  }

  private getAssetStatusFromServer(assetIdList: Array<number>): void {
    if (assetIdList.length > 0) {
      API.getAssetList(assetIdList)
        .then(
          response => {
            this.logger.debug(`[getAssetStatusFromServer] received thumb status response from server.`);
            let assetList = response.data.entries;
            assetList.forEach((asset: AssetData) => {
              this.checkAndSetThumbStatus(asset);
            });
            this.onChange();
          },
          error => {
            this.logger.error("Some exception on getting asset list from server ", error);
          }
        )
        .finally(() => {
          this.scheduleNextRefresh();
        });
    }
  }

  onFinish(uploadItemList: UploadItem[]): void {
    if (uploadItemList && uploadItemList.length > 0) {
      uploadItemList.forEach(uploadItem => {
        if (!uploadItem.isThumbGenerated()) {
          this.assetIdToUploadItemMap.set(uploadItem.getId(), new ItemForThumbCheck(uploadItem));
        }
      });
    }
    if (!this.timer) {
      this.performRefresh();
    }
  }

  onChange(): void {
    this.reporter.onStatusChange();
  }

  reset() {
    this.assetIdToUploadItemMap.clear();
    this.clearTimer();
  }

  /**
   * We use this method to resume the timer when component is mounted.
   */
  resume() {
    this.logger.debug("timer resumed");
    this._paused = false;
    this.performRefresh();
  }

  /**
   * We use this method to stop the timer, when component is unmounted.
   */
  pause() {
    this.logger.debug("timer paused");
    this._paused = true;
  }

  private scheduleNextRefresh() {
    setTimeout(this.performRefresh, INTERVAL_FOR_THUMB_CHECK);
  }
}

class ItemForThumbCheck {
  private readonly _uploadItem: UploadItem;
  private _retries: number = 0;

  constructor(uploadItem: UploadItem) {
    this._uploadItem = uploadItem;
  }

  getThumbGenerationStatus(): MediaGenerationStatus {
    return this._uploadItem.thumbStatus;
  }

  setThumbnailGenerated(status: MediaGenerationStatus) {
    this._uploadItem.setThumbGenerated(status);
  }

  get uploadItem(): UploadItem {
    return this._uploadItem;
  }

  get retries(): number {
    return this._retries;
  }

  incrementRetries() {
    return this._retries++;
  }
}

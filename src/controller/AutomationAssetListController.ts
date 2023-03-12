import { UploadItem } from "../common/Classes";
import { DEFAULT_PAGE_SIZE } from "../ui-components/utils/Constants";
import API from "../util/web/api";
import { UploadController } from "./UploadController";
import { AssetData, JSON_TYPE } from "../common/Types";
import { UploadReporter } from "./UploadReporter";
import AssetsView from "./AssetsView";
import _ from "lodash";
import { Logger } from "aws-amplify";
import { UPLOAD_STATUS } from "../common/Enums";

export default class AutomationAssetListController implements AssetsView {
  private readonly logger = new Logger("controller.AutomationAssetListController");
  private total: number = 0;
  private files: UploadItem[] = [];
  public automationId: string = "";
  private nextPageNumber: number = 0;
  private searchText: string = "";
  private reporter: UploadReporter;

  constructor(automationId: string, reporter: UploadReporter) {
    this.automationId = automationId;
    this.reporter = reporter;
  }

  public setSearchText(val: string) {
    this.searchText = val;
  }

  public resetAndLoadResults(total: number, files: UploadItem[]): void {
    this.total = total;
    this.files = files;
    this.searchText = "";
    this.nextPageNumber = 0;
  }

  public getFiles(): UploadItem[] {
    return this.files;
  }

  public getTotal(): number {
    return this.total;
  }

  public incrementPageNumber() {
    this.nextPageNumber = ++this.nextPageNumber;
  }

  public loadNextPage(isSearchData: boolean = false) {
    return new Promise((resolve, reject) => {
      const startIndex = this.nextPageNumber * DEFAULT_PAGE_SIZE;
      API.getAssetsForAutomations(
        this.automationId,
        startIndex,
        DEFAULT_PAGE_SIZE,
        this.searchText ? this.searchText : null
      )
        .then(result => {
          this.total = result.data.total;
          let uploadItemList;
          if (result?.data.entries?.length > 0) {
            this.logger.debug(
              `next page asset count ${this.total} and result entries count ${result.data.entries.length}`
            );
            let entries: AssetData[] = result.data.entries;
            uploadItemList = this.addIntoUploadedAssetQueue(entries);
            this.nextPageNumber = this.nextPageNumber + 1;
            resolve(result);
            this.logger.debug(`Added ${entries.length} to the list.`);
          } else {
            this.addIntoUploadedAssetQueue([]);
            resolve(result);
          }
          this.reporter.onNewFilesAdded(isSearchData, uploadItemList);
        })
        .catch(reject);
    });
  }

  private addIntoUploadedAssetQueue(entries: AssetData[]) {
    let uploadItemList: UploadItem[] = [];
    UploadController.mapAssetDataToUploadItem(entries, item => {
      this.files.push(item);
      uploadItemList.push(item);
    });
    return uploadItemList;
  }

  search(searchText: string) {
    this.logger.debug("searching for text", searchText);
    this.searchText = searchText;
    this.reset();
    this.loadNextPage(true).then(_.noop).catch(_.noop);
    return true;
  }

  public reset() {
    this.files = [];
    this.total = 0;
    this.nextPageNumber = 0;
  }

  delete(imageIds: string[], selectAll: boolean, ignoredForDelete: string[]): void {
    if (selectAll) {
      const ignoreAssetIds = this.findItemsByUiId(ignoredForDelete).map(uploadItems => uploadItems.getId());
      API.deleteAllAssetListFromAutomation(this.automationId, ignoreAssetIds, this.searchText).then(result => {
        this.onSuccessfulDeleteAll(result, ignoreAssetIds);
      });
    } else {
      this.logger.debug("Request has come to delete: ", imageIds);
      let assetIdList = this.findItemsByUiId(imageIds).map(uploadItem => uploadItem.getId());
      this.logger.debug("Found following upload items for deletion", assetIdList);
      API.deleteAssetListFromAutomation(assetIdList, this.automationId).then(result => {
        this.onSuccessfulDelete(result, assetIdList);
      });
    }
  }

  private findItemsByUiId(imageIds: string[]) {
    return this.files.filter((uploadItem: UploadItem) => imageIds.indexOf(uploadItem.getUiId()) != -1);
  }

  onSuccessfulDelete = (result: unknown, assetIdList: string[]) => {
    this.files = this.files.filter(uploadItem => !assetIdList.includes(uploadItem.getId()));
    this.total = this.total - assetIdList.length;
    this.reportDeletion();
  };

  private reportDeletion() {
    this.reporter.onDelete();
  }

  onSuccessfulDeleteAll = (result: unknown, ignoredAssetList: string[]) => {
    this.files = this.files.filter(uploadItem => ignoredAssetList.includes(uploadItem.getId()));
    this.total = ignoredAssetList.length;
    this.reportDeletion();
    /* if (this.files.length == 0) {
      this.reset();
      this.searchText = "";
      this.loadNextPage(false).then(_.noop).catch(_.noop);
    }
*/
  };

  getAssetsForAutomations(start: number): Promise<JSON_TYPE> {
    this.logger.info("getAssetsForAutomations", this.automationId);
    return new Promise((resolve, reject) => {
      API.getAssetsForAutomations(this.automationId, start, DEFAULT_PAGE_SIZE)
        .then(result => {
          resolve(result.data);
        })
        .catch(reject);
    });
  }

  getAssetsFirstPageForAutomation() {
    return new Promise((resolve, reject) => {
      this.logger.info("getAssetsFirstPageForAutomation", this.automationId);
      this.getAssetsForAutomations(0).then((result: JSON_TYPE) => {
        if (result?.entries?.length > 0) {
          this.resetAndLoadResults(
            parseInt(result.total),
            UploadController.convertAssetDataListToUploadItems(result.entries)
          );
          this.incrementPageNumber();
          resolve(result);
        } else {
          resolve(result);
        }
      });
    });
  }
}

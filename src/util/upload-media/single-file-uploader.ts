import { Logger, Storage } from "aws-amplify";
import { UploadItem } from "../../common/Classes";
import { UploadAssetDataFromAPI, UploadFinishAPIResponse } from "../../common/Types";
import { UploadReporter } from "../../controller/UploadReporter";
import _ from "lodash";
import API from "../web/api";
import { UPLOAD_STATUS } from "../../common/Enums";

export interface SingleAssetUploadContext {
  automationId: string;
  uploadItem: UploadItem;
  assetDataFromAPI: UploadAssetDataFromAPI;
}

export interface ActiveUpload extends CancelableUpload {
  promise(): Promise<ActiveUpload>;

  isFinished(): boolean;
}

export interface CancelableUpload {
  cancelPromise(): Promise<unknown>;
}

export interface SingleFileUploadReporter {
  onProgress(percentageDone: number, bytesTransferred: number, total: number): void;

  onUploadStart(): void;

  onUploadFinish(): void;

  onUploadCancel(): void;

  onError(error: any): void;
}

export class UploadAndSaveFileToDB implements SingleFileUploadReporter, ActiveUpload {
  private readonly logger = new Logger("util:upload-media:UploadAndSaveFileToDB");
  private readonly _reporter: UploadReporter;
  private readonly fileUploader: SingleFileUploader;
  private readonly _context: SingleAssetUploadContext;
  private _finished: boolean; //Sets true if upload is either failed or succeeded.
  private _resolve: (item: ActiveUpload) => void = _.noop;
  private _reject: (reason?: any) => void = _.noop;
  private _promise: Promise<ActiveUpload>;

  constructor(context: SingleAssetUploadContext, reporter: UploadReporter) {
    this._context = context;
    this._reporter = reporter;
    let file = this._context.uploadItem.getFile();
    let uploadPath = this._context.assetDataFromAPI.upload_path;
    // @ts-ignore
    this.fileUploader = new SingleFileUploader(this._context.uploadItem.getName(), uploadPath, file, this);
    this._finished = false;
    this._promise = Promise.resolve(this);
  }

  private coreRun(resolve: (item: ActiveUpload) => void, reject: (error: any) => void) {
    this._resolve = resolve;
    this._reject = reject;
    let name = this._context.uploadItem.getName();
    let file = this._context.uploadItem.getFile();
    this.logger.debug(`Upload: ${name} starting. size: ${file?.size}`, this._context);
    this.fileUploader.run().promise().then(_.noop).catch(_.noop);
  }

  /**
   * Note: Project won't throw error in case of cancellation.
   * Only in case of error promise will throw the error.
   */
  public run(): void {
    this._promise = new Promise<ActiveUpload>((resolve, reject) => {
      this.coreRun(resolve, reject);
    }).finally(() => {
      this._finished = true;
    });
  }

  /**
   * Please call run before calling this promise method.
   */
  public promise(): Promise<ActiveUpload> {
    return this._promise;
  }

  isFinished(): boolean {
    return this._finished;
  }

  onError(error: any): void {
    this._reporter.onError(this._context.uploadItem, error);
    this._reject(error);
  }

  onProgress(percentageDone: number, bytesTransferred: number, total: number): void {
    this._reporter.onProgress(this._context.uploadItem, percentageDone, bytesTransferred, total);
  }

  onUploadCancel(): void {
    this._reporter.onUploadCancel(this._context.uploadItem);
    this._resolve(this);
  }

  onUploadFinish(): void {
    this.logger.debug(
      `get status cancelled for name=>${this._context.uploadItem.getName()} and status=${this._context.uploadItem.getStatus()}`
    );
    if (this._context.uploadItem.getStatus() != UPLOAD_STATUS.CANCELLED) {
      this.logger.debug(
        `Upload: ${this._context.uploadItem.getName()} => saving to db... with status =>${this._context.uploadItem.getStatus()}....`,
        this._context
      );
      let file = this._context.uploadItem.getFile();
      API.entryIntoDBAfterUploadFinish(
        this._context.automationId,
        this._context.assetDataFromAPI.asset_id,
        file?.name,
        file?.size
      )
        .then((response: UploadFinishAPIResponse) => {
          this.logger.debug(`Upload: ${this._context.uploadItem.getName()} => saved to db.`, response);
          this._reporter.onUploadFinish(this._context.uploadItem, this._context.assetDataFromAPI, response);
          this._resolve(this);
        })
        .catch(error => {
          this.logger.debug(`Upload: ${this._context.uploadItem.getName()} => error in save.`, error);
          this.onError(error);
        })
        .finally(() => {
          this._resolve(this);
        });
    } else {
      this.logger.debug(`reject db save as cancelled => ${this._context.uploadItem.getName()}`);
    }
  }

  onUploadStart(): void {
    this._reporter.onUploadStart(this._context.uploadItem, this._context.assetDataFromAPI, this);
  }

  cancelPromise(): Promise<unknown> {
    return this.fileUploader.cancelPromise();
  }
}

class SingleFileUploader implements CancelableUpload {
  private readonly logger = new Logger("util:upload-media:SingleFileUploader");
  private _reporter: SingleFileUploadReporter;
  private _previousReporterPercentage: number = 0;
  private _uploadTask: any;
  private _promise: Promise<unknown> | null = null;
  private readonly _resumable: boolean = false;
  private _cancelled: boolean = false;
  private readonly _uploadPath: string;
  private readonly _file: File;
  private readonly _fileName: string;

  constructor(
    fileName: string,
    uploadPath: string,
    file: File,
    reporter: SingleFileUploadReporter,
    resumable: boolean = false
  ) {
    this._fileName = fileName;
    this._uploadPath = uploadPath;
    this._file = file;
    this._reporter = reporter;
    this._resumable = resumable;
  }

  private upload() {
    this.logger.debug(`Upload: ${this._fileName} => STARTING. Resumable: ${this._resumable}`);
    let config = {
      customPrefix: {
        public: ""
      },
      completeCallback: this.onCompleteEventFromAmplifyStorageApi,
      errorCallback: this.onUploadErrorFromAmplifyStorageApi,
      progressCallback: this.onProgressFromAmplifyStorageApi,
      resumable: this._resumable // (Boolean) Allows uploads to be paused and resumed
    };

    this._uploadTask = Storage.put(this._uploadPath, this._file, config);
    console.log("upload path", this._uploadPath);
    this.logger.debug(`Upload: ${this._fileName} => STARTED. `, this._uploadTask);
    this._promise = Promise.resolve(this._uploadTask)
      .then(this.onUploadTaskPromiseResolve)
      .catch(this.onUploadTaskPromiseError);
    this._reporter.onUploadStart();
    //Just for testing. So that we can trigger the cancel event.
    /*setTimeout(() => {
      this.cancel();
    }, 2000)*/
  }

  public run(): SingleFileUploader {
    this.upload();
    return this;
  }

  /**
   *  Must be called after run. if you need the promise.
   */
  public promise(): Promise<unknown> {
    return this._promise ? this._promise : Promise.resolve(this._uploadTask);
  }

  cancelPromise(): Promise<boolean> {
    this.logger.debug(`Upload: ${this._fileName} => cancelling...`);
    this._cancelled = true;
    return Promise.resolve(Storage.cancel(this._uploadTask))
      .then(arg => {
        this.logger.debug(`Upload: ${this._fileName} => cancelled.`);
        this._reporter.onUploadCancel();
        return arg;
      })
      .catch(error => {
        this.logger.debug(`Upload: ${this._fileName} => error in cancel.`, error);
        this._reporter.onUploadCancel();
        return error;
      });
  }

  cancel(): void {
    this.cancelPromise().then(_.noop).catch(_.noop);
  }

  private ifNotCancelled(func: () => void) {
    if (!this._cancelled) {
      func();
    }
  }

  private onProgressFromAmplifyStorageApi = (progress: any) => {
    let loaded = progress.loaded;
    let total = progress.total;
    let percentageDone = Math.ceil((loaded / total) * 100);
    this.onProgress(percentageDone, loaded, total);
  };

  private onCompleteEventFromAmplifyStorageApi = (event: any) => {
    this.logger.debug(`Upload: ${this._fileName} => Finished.`);
    this._reporter.onUploadFinish();
  };

  private onProgress(percentageDone: number, bytesTransferred: number, total: number) {
    //this.logger.debug(`Upload: ${this._fileName} => ${percentageDone}`);
    this._reporter.onProgress(percentageDone, bytesTransferred, total);
  }

  private onUploadErrorFromAmplifyStorageApi = (error: any) => {
    if (_.isError(error)) {
      if (error.message.toLowerCase().indexOf("cancelled") != -1) {
        //This error is generated after cancellation. So, we can ignore it.
        return;
      }
    }
    this.ifNotCancelled(() => {
      this.logger.debug(`Upload: ${this._fileName} encountered error.`, error, typeof error);
      this._reporter.onError(error);
    });
  };

  private onUploadTaskPromiseResolve = (arg1: any) => {
    this.logger.debug(`Upload: ${this._fileName} => promise resolved`, arg1);
    if (!this._resumable) {
      //In case of resumable. Storage API, won't call the complete event.
      this.onCompleteEventFromAmplifyStorageApi(arg1);
    } else {
    }
    return arg1;
  };

  private onUploadTaskPromiseError = (error: any) => {
    this.logger.debug(`Upload: ${this._fileName} => error.`, error);
    this.ifNotCancelled(() => {
      //If the upload is cancelled. We don't want to raise the error further.
      if (!this._resumable) {
        //In case of resumable. Storage API, won't call the error event.
        this.onUploadErrorFromAmplifyStorageApi(error);
      }
    });
    return error;
  };
}

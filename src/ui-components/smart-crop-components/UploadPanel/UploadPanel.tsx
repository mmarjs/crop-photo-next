import { Component } from "react";
import { t } from "i18next";
import AssetsView from "../../../controller/AssetsView";
import AutomationAssetListController from "../../../controller/AutomationAssetListController";
import { ThumbController } from "../../../controller/ThumbController";
import { UploadController } from "../../../controller/UploadController";
import { UploadReporter } from "../../../controller/UploadReporter";
import { toast } from "../../components/toast";
import UploadMedia from "../../smart-crop/selectmedia/uploadmedia";
import styles from "./UploadPanel.module.scss";
import { Logger } from "aws-amplify";
import { UploadItem } from "../../../common/Classes";
import { OBJECT_TYPE, UploadAssetDataFromAPI, UploadFinishAPIResponse } from "../../../common/Types";
import { AUTOMATION_STATUS, UPLOAD_STATUS } from "../../../common/Enums";
import { CancelableUpload } from "../../../util/upload-media/single-file-uploader";
import { Router } from "next/router";
import JobStartMessage from "../../../models/JobStartMessage";
import { CropConfigName, DownloadFormat, SocialMediaFormats } from "../../smart-crop/select-format/select-format-utils";
import MediaSize from "../../../models/MediaSize";
import API from "../../../util/web/api";
import Optional from "../../../util/Optional";
import JobStartResponse from "../../../models/JobStartResponse";
import _ from "lodash";
import { useIntercom } from "react-use-intercom";
import Header from "../Header";

type SelectMediaProps = {
  automationId: string;
  onConfigSave: Function;
  onUploadSuccess: Function;
  updateJobId: Function;
  leftPanelActive?: boolean;
};

type State = {
  pageLoading: boolean;
  isStartingAutomation: boolean;
  assetsView: AssetsView;
  triggerRender: number;
  isSearchResultLoad: boolean;
  closeModal: boolean;
  isPlanExpiredModalOpen: boolean;
  planExpiredErrorMessage: string;
};

// @ts-ignore
function withUseIntercomHook(Component) {
  // @ts-ignore
  return function WrappedComponent(props) {
    const { trackEvent } = useIntercom();
    return <Component {...props} trackEvent={trackEvent} />;
  };
}

interface useIntercomHookProps {
  trackEvent: Function;
}

class UploadPanel extends Component<SelectMediaProps, State, useIntercomHookProps> implements UploadReporter {
  private readonly uploadController: UploadController;
  private readonly automationAssetListController: AutomationAssetListController;
  private readonly thumbController: ThumbController;
  private readonly logger = new Logger("ui-components.unrecognizable-crop.UploadPanel");

  constructor(props: SelectMediaProps) {
    super(props);

    this.handleUnload = this.handleUnload.bind(this);
    this.uploadController = new UploadController(this);
    if (this.props?.automationId) {
      this.uploadController.setAutomationId(this.props.automationId);
    }
    this.automationAssetListController = new AutomationAssetListController(this.props.automationId, this);
    this.thumbController = new ThumbController(this);
    this.onNext = this.onNext.bind(this);
    this.state = {
      pageLoading: true,
      isStartingAutomation: false,
      assetsView: this.automationAssetListController,
      triggerRender: 0,
      isSearchResultLoad: false,
      closeModal: false,
      isPlanExpiredModalOpen: false,
      planExpiredErrorMessage: ""
    };
  }

  onStatusChange(): void {
    this.logger.debug("[onStatusChange] Status change event fired from ThumbController.");
    this.setState({ triggerRender: this.state.triggerRender + 1 });
    this.forceUpdate();
    return;
  }

  cancelAllUploads = () => {
    return new Promise((resolve, reject) => {
      this.uploadController.delete([], true, [], false);
      resolve(null);
    });
  };

  componentWillUnmount() {
    window.removeEventListener("beforeunload", this.handleUnload);
    Router.events.off("routeChangeStart", this.handleRouteChange);
    this.thumbController.pause();
  }

  handleUnload(e: any) {
    if (this.uploadController.isRunning()) {
      e.preventDefault();
      e.returnValue = "";
    }
  }

  handleRouteChange = () => {
    if (this.uploadController.isRunning()) {
      if (confirm(t("upload.page_out_upload_cancel_confirm"))) {
        this.uploadController.delete([], true, []);
      }
    }
  };

  componentDidMount() {
    // @ts-ignore
    this.props.trackEvent("crop-select-media"); //This will allow us to track how much time did they spend in the upload
    window.addEventListener("beforeunload", this.handleUnload);
    Router.events.on("routeChangeStart", this.handleRouteChange);
    this.thumbController.resume();
    this.setState({ pageLoading: true });
    this.automationAssetListController.getAssetsFirstPageForAutomation().then(() => {
      this.thumbController.reset(); //Assuming that UI is switched from upload view to assetlistview.
      this.thumbController.onFinish(this.automationAssetListController.getFiles());
      this.setState({ pageLoading: false });
    });
  }

  uploadFiles = (fileList: FileList | File[]) => {
    let fileArray = Array.from(fileList);
    let acceptedList: File[] = [];
    let rejectedList: File[] = [];
    fileArray.forEach(file => {
      if (UploadController.isAcceptedUpload(file)) {
        acceptedList.push(file);
      } else {
        rejectedList.push(file);
      }
    });
    if (acceptedList.length > 0) {
      this.logger.debug("Starting upload.");
      this.setState({ assetsView: this.uploadController });
      this.logger.debug(`uploading assets count in queue: ${this.uploadController.getFiles().length}`);
      if (this.uploadController.getFiles().length <= 0) this.thumbController.reset(); //Assuming that UI is switched from assetlistview to upload view.
      this.uploadController.onFilesDrop(acceptedList);
    }

    if (rejectedList.length > 0) {
      toast(t("upload.files_skipped"), "warning");
    }
  };

  onNewFilesAdded(isSearchData: boolean = false, uploadItemList: UploadItem[]): void {
    this.logger.debug(
      `onNewFilesAdded(Dropped): isSearchData:${isSearchData} upload helper queue size: ${
        this.uploadController.getFiles().length
      }`
    );
    if (uploadItemList) {
      this.thumbController.onFinish(uploadItemList);
    }
    this.setState({
      triggerRender: this.state.triggerRender + 1,
      isSearchResultLoad: isSearchData
    });
  }

  onUploadStart(item: UploadItem, assetUploadedData: UploadAssetDataFromAPI, cancelableUpload: CancelableUpload): void {
    // @ts-ignore
    this.props.trackEvent("crop-upload-started");
    item.setStatus(UPLOAD_STATUS.RUNNING);
    //this.setState({files: this.uploadController.getQueue()});
  }

  onAllTheUploadFinished(): void {
    this.setState({ pageLoading: true });
    this.automationAssetListController.getAssetsFirstPageForAutomation().then(result => {
      this.setState({ assetsView: this.automationAssetListController, pageLoading: false });
      this.thumbController.reset(); //Assuming that UI is switched from upload view to assetlistview.
      this.logger.debug("after all the upload finished", this.automationAssetListController.getFiles());
      this.thumbController.onFinish(this.automationAssetListController.getFiles());
    });
  }

  onProgress(item: UploadItem, progressValue: number): void {
    let progress = Math.trunc(progressValue);
    item.incrementProgress(progress);
    this.setState({ triggerRender: this.state.triggerRender + 1 });
  }

  onUploadFinish(item: UploadItem, assetUploadedData: UploadAssetDataFromAPI, response: UploadFinishAPIResponse): void {
    let onfulfilled = (response: UploadFinishAPIResponse) => {
      if (response.asset_data) {
        item.setThumbGenerated(response.asset_data.thumb_generated);
        item.setId(response.asset_data.id);
        item.setThumbnailUrl(response.asset_data.thumb_url);
        item.setStatus(UPLOAD_STATUS.FINISHED);
        this.thumbController.onFinish([item]);
        this.logger.debug(`finish count=${this.uploadController.getFinishedCount()}`);
        /*if (this.uploadController.getUploadingAssetCount() === this.uploadController.getFinished()) {
          this.uploadController.setOverallStatus(UPLOAD_STATUS.FINISHED);
          // @ts-ignore
          this.props.trackEvent("crop-upload-completed");
          this.uploadController.resetUploadQueue();
          this.getAssetsFirstPageForAutomation();
        }*/
        //this.setState({ files: this.uploadController.getQueue() });
      }
    };
    onfulfilled(response);
  }

  onDelete(): void {
    this.logger.debug("Some assets deletion reporter.");
    this.setState({
      assetsView: this.uploadController.getTotal() == 0 ? this.automationAssetListController : this.uploadController
    });
  }

  private canSwitchToGalleryView() {
    return this.state.assetsView.getFiles().length > 0;
  }

  onUploadCancel(uploadItem: UploadItem): void {
    uploadItem.setStatus(UPLOAD_STATUS.CANCELLED);
  }

  onError(item: UploadItem, error: any): void {
    //Todo: In case of error. Remove the entry to list.
    //@Achin.
  }

  onNext({ original, customFormats, socialMedia, parameters }: OBJECT_TYPE): void {
    //Todo: @Manoj, @John we need to send the job start message from. Job start messages must be populated from Download form options.
    const jobStartMessage: JobStartMessage = new JobStartMessage();
    this.setState({
      isStartingAutomation: true
    });
    if (original) {
      jobStartMessage.smartCropDownloadOptions.mediaConversionOptions.push(
        new DownloadFormat(_.random(5, true), CropConfigName.ORIGINAL)
      );
    }
    if (customFormats?.length > 0) {
      customFormats.forEach((el: any) => {
        const split = el.split("x");
        const width = split[0];
        const height = split[1];
        jobStartMessage.smartCropDownloadOptions.mediaConversionOptions.push(
          new DownloadFormat(
            _.random(6, 6 + customFormats.length, true),
            CropConfigName.CUSTOM,
            new MediaSize(Number(width), Number(height))
          )
        );
      });
    }
    if (socialMedia?.length > 0) {
      //Todo: Use prop Typescript types.
      // @ts-ignore
      socialMedia.forEach(formatIndex => {
        jobStartMessage.smartCropDownloadOptions.mediaConversionOptions.push(
          SocialMediaFormats[0].formats[formatIndex]
        );
      });
    }

    if (!!parameters) {
      jobStartMessage.smartCropDownloadOptions.parameters = parameters;
    }
    // if (checkedVideoFormats?.length > 0) {
    //   checkedSocialsFormats.forEach(formatIndex => {
    //     jobStartMessage.smartCropDownloadOptions.mediaConversionOptions.push(
    //       SocialMediaFormats[1].formats[formatIndex]
    //     );
    //   });
    // }
    this.logger.debug("onNext starting automation", jobStartMessage);
    try {
      this.setState({
        closeModal: false
      });
      API.startSmartCropAutomation(this.props.automationId, jobStartMessage)
        .then((response: Optional<JobStartResponse>) => {
          const jobId = response.get().getJobId();
          this.logger.info("onClick Next startSmartCropAutomation", jobId);
          this.props.updateJobId(jobId);
          this.setState({
            isStartingAutomation: false
          });
          this.props.onConfigSave(AUTOMATION_STATUS.RUNNING, `/smart-crop?automationId=${this.props.automationId}`);
        })
        .catch((error: any) => {
          this.logger.error("startSmartCropAutomation", error);
          this.setState({
            isStartingAutomation: false,
            closeModal: true,
            isPlanExpiredModalOpen: true,
            planExpiredErrorMessage: error?.response.data.detail ?? error.toString()
          });
          // toast(error?.response.data.detail ?? error.toString(), "error");
          //throw new Error(error);
        });
    } catch (error: any) {
      this.logger.error("startSmartCropAutomation", error);
      this.setState({
        isStartingAutomation: false
      });
      toast(error?.message ?? error.toString(), "error");
    }
  }

  render() {
    return (
      <>
        <Header hideSlider label="Select Media" />
        <div className={styles.UploadPanel}>
          <UploadMedia
            uploadFiles={this.uploadFiles}
            isGallery={this.state.isSearchResultLoad || this.state.assetsView.getTotal() > 0}
            uploadController={this.uploadController}
            assetsView={this.state.assetsView}
            leftPanelActive={this.props.leftPanelActive}
          />
        </div>
      </>
    );
  }
}

export default withUseIntercomHook(UploadPanel);

import { Router, useRouter } from "next/router";
import NextRouter from "next/router";
import { Button } from "../../components/button";
import UploadMedia from "./uploadmedia";
import { RadioChangeEvent } from "antd";
import { Breadcrumbs } from "../../components/breadcrumb";
import { HOME_PAGE, redirectToPath } from "../../../lib/navigation/routes";
import styles from "../../../styles/UploadMedia.module.css";
import React, { useEffect, useState } from "react";
import { UploadController } from "../../../controller/UploadController";
import { UploadItem } from "../../../common/Classes";
import { UploadReporter } from "../../../controller/UploadReporter";
import { AUTOMATION_STATUS, UPLOAD_STATUS } from "../../../common/Enums";
import { CustomModal } from "../../../ui-components/components/modal";
import { OBJECT_TYPE, UploadAssetDataFromAPI, UploadFinishAPIResponse } from "../../../common/Types";
import API from "../../../util/web/api";
import Image from "next/image";
import { Logger } from "aws-amplify";
import { toast } from "../../components/toast";
import { t } from "i18next";
import { useTranslation } from "react-i18next";
import SelectFormat from "../select-format";
import JobStartMessage from "../../../models/JobStartMessage";
import {
  CropConfigName,
  DownloadFormat,
  Parameters as FormatParameters,
  SocialMediaFormats
} from "../select-format/select-format-utils";
import _ from "lodash";
import JobStartResponse from "../../../models/JobStartResponse";
import MediaSize from "../../../models/MediaSize";
import { useIntercom } from "react-use-intercom";
import { CancelableUpload } from "../../../util/upload-media/single-file-uploader";
import AutomationAssetListController from "../../../controller/AutomationAssetListController";
import Optional from "../../../util/Optional";
import AssetsView from "../../../controller/AssetsView";
import { ThumbController } from "../../../controller/ThumbController";
import { ThumbReporter } from "../../../controller/ThumbReporter";
import Form from "antd/lib/form";
import Parameters from "../parameters";
import useDebounce from "../../../hooks/useDebounce";
import { Modal } from "../../components/modal/modal";
import { ProblemJSONErrorCodeToMessageMapping } from "../../../util/exception/ProblemJsonErrorCodeToMesaageMapping";

type UploadMediaHeaderProps = {
  status: UPLOAD_STATUS;
  onNext: Function;
  onUploadSuccess: Function;
  uploadCancel: Function;
  isStartingAutomation: boolean;
  uploadFilesLength: number;
  closeModal: boolean;
};

const regex = /^#([0-9A-F]{3}){1,2}$/i;

const UploadMediaHeader = ({
  status,
  onNext,
  uploadCancel,
  isStartingAutomation,
  uploadFilesLength,
  closeModal
}: UploadMediaHeaderProps) => {
  let breadcrumbPathArray = [["Configuration"], ["Select Media"]];
  const [isModalVisible, toggleModal] = useState(false);
  const [addCustomIsDisplayed, setAddCustomIsDisplayed] = useState(false);
  const [disableForm, setDisableForm] = useState(true);
  const [formValues, setFormValues] = useState<OBJECT_TYPE>({});
  const [parameter, setParameter] = useState("transparent");
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const { trackEvent } = useIntercom();
  const [hexColor, setHexColor] = useState<string>("");
  const [isValidHex, setIsValidHex] = useState<boolean>(true);
  const debouncedHexColor = useDebounce(hexColor, 300);

  useEffect(() => {
    const isValid = regex.test(debouncedHexColor);
    setIsValidHex(isValid);
  }, [debouncedHexColor]);

  useEffect(() => {
    if (closeModal === true) toggleModal(false);
  }, [closeModal]);

  const router = useRouter();

  const onCloseClick = () => {
    if (status === UPLOAD_STATUS.RUNNING) {
      if (confirm(t("upload.page_out_upload_cancel_confirm"))) {
        uploadCancel()
          .then(() => {
            redirectToPath(HOME_PAGE, router, window);
          })
          .catch(() => {
            redirectToPath(HOME_PAGE, router, window);
          });
      }
    } else {
      redirectToPath(HOME_PAGE, router, window);
    }
  };

  const handleParamChange = (e: RadioChangeEvent) => {
    setParameter(e.target.value);
  };

  const handleHexChange = (hex: string) => {
    setHexColor(hex);
  };

  const handleShowAddCustom = (show: boolean) => {
    setAddCustomIsDisplayed(show);
  };

  const steps = [
    {
      title: t("upload.select_media_modal.title"),
      content: <SelectFormat onShowAddCustom={handleShowAddCustom} />
    },
    {
      title: t("upload.parameters.title"),
      content: (
        <Parameters
          onParamChange={handleParamChange}
          parameter={parameter}
          onHexColorChange={handleHexChange}
          isValidHex={isValidHex}
        />
      )
    }
  ];

  const next = (values: any) => {
    setFormValues(values);
    setCurrent(current => current + 1);
  };

  const cancel = () => {
    toggleModal(false);
    setCurrent(0);
  };

  const onFieldChange = (values: any, allValues: any) => {
    let flag = true;
    allValues.map((field: any) => {
      if (
        (field?.name[0] === "original" && field?.value) ||
        (field?.name[0] === "customFormats" && field?.value?.length > 0)
      ) {
        flag = false;
      }
    });
    setDisableForm(flag);
  };

  const handleNext = (values: OBJECT_TYPE) => {
    next(values);
  };

  const goToSmartCrop = () => {
    const isWhite = parameter === "white";
    const isTransparent = parameter === "transparent";
    const params = new FormatParameters();
    params.allowPadding = true;
    params.paddingColor = isWhite || isTransparent ? "#FFFFFF" : hexColor;
    params.transparency = isTransparent ? 1 : 0;
    const newFormValues = {
      ...formValues,
      parameters: params
    };
    onNext(newFormValues);
  };

  return (
    <div className={styles.uploadMedia_Header}>
      <Button
        onClick={onCloseClick}
        type="text"
        icon={<Image src="/images/cross.svg" width={10} height={10} alt="" />}
      />
      <div>
        <Breadcrumbs pathArray={breadcrumbPathArray} />
      </div>
      <Button
        className={styles.nextButton}
        label={"Next"}
        type="primary"
        disabled={(status !== UPLOAD_STATUS.FINISHED && status !== UPLOAD_STATUS.CANCELLED) || uploadFilesLength === 0}
        onClick={() => toggleModal(true)}
      />

      <CustomModal
        title={steps[current]?.title}
        visible={isModalVisible}
        onCancel={cancel}
        noFooter
        customStyles={{
          display: addCustomIsDisplayed ? "none" : "block"
        }}
      >
        <div className={styles.StartModalContent}>
          <Form
            form={form}
            initialValues={{ original: false }}
            onFieldsChange={onFieldChange}
            id="custom-format-form"
            onFinish={handleNext}
            autoComplete="off"
          >
            {
              <>
                {current === 0 ? <p className={styles.SelectMediaDesc}>{t("upload.select_media_modal.desc")}</p> : null}
                <div className={styles.SelectMediaStepContent}>{steps[current]?.content}</div>
                <div className={styles.SelectMediaStepAction}>
                  {current === 0 ? (
                    <Button type="primary" formId="custom-format-form" disabled={disableForm}>
                      {t("upload.select_media_modal.next")}
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      onClick={() => {
                        trackEvent("crop-automation-start");
                        goToSmartCrop();
                      }}
                      loading={isStartingAutomation}
                      disabled={!isValidHex}
                    >
                      {t("upload.select_media_modal.ok_text")}
                    </Button>
                  )}
                  <Button type="text" onClick={cancel} className={styles.CancelBtn}>
                    {t("upload.select_media_modal.cancel_text")}
                  </Button>
                </div>
              </>
            }
          </Form>
        </div>
      </CustomModal>
    </div>
  );
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
type SelectMediaProps = {
  automationId: string;
  onConfigSave: Function;
  onUploadSuccess: Function;
  updateJobId: Function;
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

class SelectMedia
  extends React.Component<SelectMediaProps, State, useIntercomHookProps>
  implements UploadReporter, ThumbReporter
{
  private readonly uploadController: UploadController;
  private readonly automationAssetListController: AutomationAssetListController;
  private readonly thumbController: ThumbController;
  private readonly logger = new Logger("ui-components.smart-crop.SelectMedia");

  constructor(props: SelectMediaProps) {
    super(props);
    this.handleUnload = this.handleUnload.bind(this);
    this.uploadController = new UploadController(this);
    this.uploadController.setAutomationId(this.props.automationId);
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

  uploadFiles = (fileList: File[]) => {
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
          this.logger.error("startSmartCropAutomation", error.problemJson._title);
          let errorString: string = error?.problemJson?.type
            ? ProblemJSONErrorCodeToMessageMapping(error?.problemJson?.type)
            : error.problemJson.detail?._title;
          if (error.problemJson.type === "insufficient_credits") {
            this.setState({
              isStartingAutomation: false,
              closeModal: true,
              isPlanExpiredModalOpen: true,
              planExpiredErrorMessage: error?.problemJson?.type ? t(errorString) : ""
            });
          } else {
            toast(error?.response.data.detail ?? error.toString(), "error");
          }
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
      <div>
        <div className={styles.headerWrapper}>
          <UploadMediaHeader
            status={this.uploadController.isRunning() ? UPLOAD_STATUS.RUNNING : UPLOAD_STATUS.FINISHED}
            onNext={this.onNext}
            onUploadSuccess={() => this.props.onUploadSuccess([...this.state.assetsView.getFiles()])}
            uploadCancel={this.cancelAllUploads}
            isStartingAutomation={this.state.isStartingAutomation}
            uploadFilesLength={this.state.assetsView.getFiles().length}
            closeModal={this.state.closeModal}
          />
        </div>
        {!this.state.pageLoading ? (
          <div className={styles.selectMediaMainDiv}>
            <UploadMedia
              uploadFiles={this.uploadFiles}
              isGallery={this.state.isSearchResultLoad || this.state.assetsView.getTotal() > 0}
              uploadController={this.uploadController}
              assetsView={this.state.assetsView}
            />
          </div>
        ) : null}
        <Modal
          title="Plan expired"
          visible={this.state.isPlanExpiredModalOpen}
          onOk={() => {
            NextRouter.push("/user/settings/billing");
          }}
          onCancel={() => this.setState({ isPlanExpiredModalOpen: false })}
          okText="Go to billing"
          cancelText="Cancel"
          danger={true}
          type="primary"
        >
          <p>{this.state.planExpiredErrorMessage}</p>
        </Modal>
      </div>
    );
  }
}

export default withUseIntercomHook(SelectMedia);

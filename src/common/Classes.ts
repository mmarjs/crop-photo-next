import { UPLOAD_STATUS } from "./Enums";
import _ from "lodash";
import { MediaGenerationStatus } from "./Types";
import { StringUtil } from "../ui-components/utils";

let ID_COUNTER = 0;

export class UploadItem {
  private file: File | null;
  //Not a backend asset id. Just of reference the items in memory.
  private id: string = "";
  private readonly uiID: string = "ui_id-" + ++ID_COUNTER;
  private status: UPLOAD_STATUS;
  private progress: number = 0;
  private readonly name: string;
  private imageUrl: string = "";
  private thumbnailUrl: string = "";
  private evaporateId: string = "";
  private size: number = 0;
  private _thumbStatus: MediaGenerationStatus = MediaGenerationStatus.PENDING;
  private previewStatus: MediaGenerationStatus = MediaGenerationStatus.PENDING;
  //Todo: add asset id for backend listing.
  //Todo: remove any evaporate related code form here. This class is purely for rendering purpose.
  /*
   *
   * @param file
   * @param name This is just for testing. Will remove later.
   */
  constructor(file: File | null, name: string | null = null) {
    this.file = file;
    this.name = file ? file.name : name ? name : "";
    this.status = UPLOAD_STATUS.NOT_STARTED;
  }

  getUiId(): string {
    return this.uiID;
  }

  getName() {
    return this.name;
  }

  getStatus(): UPLOAD_STATUS {
    return this.status;
  }

  setStatus(status: UPLOAD_STATUS) {
    this.status = status;
  }

  getUploadProgress() {
    return this.progress;
  }

  incrementProgress(value: number) {
    this.progress = value;
  }

  getFile() {
    return this.file;
  }

  setFile(file: File) {
    this.file = file;
  }

  getId() {
    return this.id;
  }

  setId(val: string) {
    this.id = val;
  }

  getImageUrl() {
    return this.imageUrl;
  }

  setImageUrl(url: string) {
    this.imageUrl = url;
  }

  getThumbnailUrl() {
    return this.thumbnailUrl;
  }

  setThumbnailUrl(url: string) {
    this.thumbnailUrl = url;
  }

  getEvaporateId() {
    return this.evaporateId;
  }

  setEvaporateId(evaporateId: string) {
    this.evaporateId = evaporateId;
  }

  getSize() {
    return this.size;
  }

  setSize(size: number) {
    this.size = size;
  }

  isThumbGenerated() {
    return this._thumbStatus == MediaGenerationStatus.SUCCESS;
  }

  isThumbGenerationFailed() {
    return this._thumbStatus == MediaGenerationStatus.FAILED;
  }

  setThumbGenerated(_thumbStatus: MediaGenerationStatus) {
    this._thumbStatus = _thumbStatus;
  }

  isPreviewGenerated() {
    return this.previewStatus == MediaGenerationStatus.SUCCESS;
  }

  setPreviewGenerated(val: MediaGenerationStatus) {
    this.previewStatus = val;
  }

  get thumbStatus(): MediaGenerationStatus {
    return this._thumbStatus;
  }

  set thumbStatus(value: MediaGenerationStatus) {
    this._thumbStatus = value;
  }
}

export class UploadAWSConfig {
  private readonly awsAccessKeyId: string;
  private readonly awsRegion: string;
  private readonly awsBucketName: string;

  constructor(awsKey: string, awsRegion: string, awsBucketName: string) {
    this.awsAccessKeyId = awsKey;
    this.awsRegion = awsRegion;
    this.awsBucketName = awsBucketName;
  }

  getAwsAccessKeyId() {
    return this.awsAccessKeyId;
  }

  getAwsRegion() {
    return this.awsRegion;
  }

  getAwsBucketName() {
    return this.awsBucketName;
  }
}

export class CustomerCurrentPlan {
  private currentPlan: string = "";
  private planRate: string = "";
  private planDuration: string = "";
  private planDescription: string = "";
  private planLevel: string = "";
  private priceId: string = "";
  private nextChargeDate: string = "";
  private currentBalance: string = "";
  private overageCharge: number = 0;
  private scheduledPlanName: string = "";
  private planEndDate: string = "";
  constructor() {}
  getCurrentPlan() {
    return this.currentPlan;
  }
  setCurrentPlan(value: string) {
    this.currentPlan = value;
  }
  getPlanRate() {
    return this.planRate;
  }
  setPlanRate(value: string) {
    this.planRate = value;
  }
  getPlanDuration() {
    return this.planDuration;
  }
  setPlanDuration(value: string) {
    this.planDuration = value;
  }
  getNextChargeDate() {
    return this.nextChargeDate;
  }

  setNextChargeDate(value: string) {
    this.nextChargeDate = value;
  }

  getCurrentBalance() {
    return this.currentBalance;
  }

  setCurrentBalance(value: string) {
    this.currentBalance = value;
  }

  setOverageCharge(value: number) {
    this.overageCharge = value;
  }

  getOverageCharge() {
    return this.overageCharge;
  }

  getScheduledPlanName() {
    return this.scheduledPlanName;
  }

  setScheduledPlanName(value: string) {
    this.scheduledPlanName = value;
  }

  getPlanEndDate() {
    return this.planEndDate;
  }

  setPlanEndDate(value: string) {
    this.planEndDate = value;
  }
}

export class UserCardData {
  private cardType: string = "";
  private cardNumber: string = "";
  private cardExpireDate: string = "";
  private paymentMethodId: string = "";

  getCardType() {
    return this.cardType;
  }
  setCardType(value: string) {
    this.cardType = value;
  }
  getCardNumber() {
    return this.cardNumber;
  }
  setCardNumber(value: string) {
    this.cardNumber = value;
  }
  getCardExpireDate() {
    return this.cardExpireDate;
  }
  setCardExpireDate(value: string) {
    this.cardExpireDate = value;
  }
  getPaymentMethodId(): string {
    return this.paymentMethodId;
  }

  setPaymentMethodId(value: string) {
    this.paymentMethodId = value;
  }

  isEmpty() {
    return StringUtil.isEmpty(this.cardNumber);
  }
}

export class PromoCodeResponse {
  private amountOffInCents: number = 0;
  private percentOff: number = 0;
  private couponId: string = "";
  private id: string = "";
  private valid: boolean = false;

  getAmountOffInCents(): number {
    return this.amountOffInCents;
  }

  setAmountOffInCents(value: number) {
    this.amountOffInCents = value;
  }

  getPercentOff(): number {
    return this.percentOff;
  }

  setPercentOff(value: number) {
    this.percentOff = value;
  }

  getCouponId(): string {
    return this.couponId;
  }

  setCouponId(value: string) {
    this.couponId = value;
  }

  getId(): string {
    return this.id;
  }

  setId(value: string) {
    this.id = value;
  }

  getValid() {
    return this.valid;
  }

  setValid(value: boolean) {
    this.valid = value;
  }

  isEmpty() {
    return StringUtil.isEmpty(this.id);
  }
}

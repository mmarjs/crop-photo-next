import {OBJECT_TYPE, PlanStatus} from "../../../common/Types";
import {PlanDuration, PlanNames} from "../../enums/PlanDuration";
import {Logger} from "aws-amplify";

export class PlanDetails {
  private _planName: string;
  private _planRate: number;
  private _planDescription: string;
  private _planDuration: PlanDuration;
  private _priceId: string;
  private _planLevel: number;
  private _planStatus: PlanStatus;
  private _planMetaData!: OBJECT_TYPE | undefined;

  constructor(
    planName: string,
    planRate: number,
    planDescription: string,
    planDuration: string,
    priceId: string,
    planLevel: number,
    planStatus: PlanStatus,
    planMetaData?: OBJECT_TYPE
  ) {
    this._planName = planName;
    this._planRate = planRate;
    this._planDescription = planDescription;
    if (planDuration === "month") this._planDuration = PlanDuration.MONTHLY;
    else if (planDuration === "week" || planDuration === "day") this._planDuration = PlanDuration.WEEKLY;
    else this._planDuration = PlanDuration.YEARLY;

    this._priceId = priceId;
    this._planLevel = planLevel;
    this._planStatus = planStatus;
    if (!!planMetaData) {
      this._planMetaData = planMetaData;
    }
  }

  set planMetaData(meta: OBJECT_TYPE | undefined) {
    this._planMetaData = meta;
  }

  get planMetaData(): OBJECT_TYPE | undefined {
    return this._planMetaData;
  }
  get planName(): string {
    return this._planName;
  }

  set planName(value: string) {
    this._planName = value;
  }

  get planRate(): number {
    return this._planRate;
  }

  set planRate(value: number) {
    this._planRate = value;
  }

  get planDescription(): string {
    return this._planDescription;
  }

  set planDescription(value: string) {
    this._planDescription = value;
  }

  get planDuration(): string {
    return this._planDuration;
  }

  set planDuration(value: string) {
    if (value !== "month" || "week") this._planDuration = PlanDuration.MONTHLY;
    else this._planDuration = PlanDuration.YEARLY;
  }

  get priceId(): string {
    return this._priceId;
  }

  set priceId(value: string) {
    this._priceId = value;
  }

  get planLevel(): number {
    return this._planLevel;
  }

  set planLevel(value: number) {
    this._planLevel = value;
  }

  get planStatus(): PlanStatus {
    return this._planStatus;
  }

  set planStatus(value: PlanStatus) {
    this._planStatus = value;
  }

  isMonthly(): boolean {
    return this._planDuration === PlanDuration.MONTHLY;
  }

  isWeekly(): boolean {
    return this._planDuration === PlanDuration.WEEKLY;
  }

  isYearly(): boolean {
    return this._planDuration === PlanDuration.YEARLY;
  }

  isEssential(): boolean {
    return this._planName === PlanNames.ESSENTIAL;
  }

  isStudio(): boolean {
    return this._planName === PlanNames.STUDIO;
  }

  isEnterprise(): boolean {
    return this._planName === PlanNames.ENTERPRISE;
  }

  isFree(): boolean {
    return this._planName === PlanNames.FREE;
  }
}

export interface CurrentPlan {
  is_expired: boolean;
  price_id: string;
}

export default class PlanDetailsResponse {
  private readonly logger = new Logger("ui-components:components:plan-config:PlanDetailsResponse");
  private _listPlanDetails: PlanDetails[];
  private _currentPlanDetails: CurrentPlan;

  constructor(entries: any) {
    let planArray = entries.list_plan_details;
    let currentPlan = entries.price_id_response;
    let plansDetailsArray = Array<PlanDetails>();
    this._listPlanDetails = [];
    planArray.forEach((plan: any, key: any) => {
      let planDetails = new PlanDetails(
        plan.plan_name,
        plan.plan_rate,
        plan.plan_description,
        plan.plan_duration,
        plan.price_id,
        plan.plan_level,
        plan.status,
        plan.price_metadata
      );
      plansDetailsArray.push(planDetails);
    });
    this._listPlanDetails = plansDetailsArray;
    this._currentPlanDetails = currentPlan;
  }

  getCurrentPlan() {
    return this._currentPlanDetails;
  }

  getUserPlan(): PlanDetails | undefined {
    const userPlan = this._listPlanDetails.find(plan => {
      this.logger.debug("User Price Id::", this._currentPlanDetails.price_id);
      return plan.priceId === this._currentPlanDetails.price_id;
    });
    this.logger.debug("getUserPlan", userPlan);
    if (!userPlan) return undefined;
    return userPlan;
  }

  sortPlans() {
    this._listPlanDetails.sort((a, b) => {
      return a.planLevel - b.planLevel;
    });
    return this._listPlanDetails;
  }
}

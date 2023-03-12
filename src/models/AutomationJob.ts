import { OBJECT_TYPE } from "../common/Types";
import Optional from "../util/Optional";
import { HttpResultType } from "../util/web/http-client";
import HttpResponseDeserializer from "../util/web/http-response-deserializer";

export type AutomationJobType = {
  automation_job_status: string;
  finished_assets: OBJECT_TYPE;
  job_explore: OBJECT_TYPE;
  job_progress: OBJECT_TYPE;
};

export default class AutomationJob {
  private _elapsedTime: number = 0;
  private _elapsedTimePerAsset: number = 0;
  private _costEstimate: number = 0;
  private _costPerAsset: number = 0;
  private _costSaved: number = 0;
  private _costSavedPerAsset: number = 0;
  private _humanTime: number = 0;
  private _automationTime: number = 0;
  private _automationCost: number = 0;
  private _humanCost: number = 0;
  private _hasAutomationDetails: boolean = false;

  constructor() {}

  set hasAutomationDetails(hasDetails: boolean) {
    this._hasAutomationDetails = hasDetails;
  }

  get hasAutomationDetails(): boolean {
    return this._hasAutomationDetails;
  }

  set elapsedTime(time: number) {
    this._elapsedTime = time;
  }

  get elapsedTime(): number {
    return this._elapsedTime;
  }

  set elapsedTimePerAsset(time: number) {
    this._elapsedTimePerAsset = time;
  }

  get elapsedTimePerAsset(): number {
    return this._elapsedTimePerAsset;
  }

  set costEstimate(cost: number) {
    this._costEstimate = cost;
  }

  get costEstimate(): number {
    return this._costEstimate;
  }

  set costPerAsset(cost: number) {
    this._costPerAsset = cost;
  }

  get costPerAsset(): number {
    return this._costPerAsset;
  }

  set costSaved(cost: number) {
    this._costSaved = cost;
  }

  get costSaved(): number {
    return this._costSaved;
  }

  set costSavedPerAsset(cost: number) {
    this._costSavedPerAsset = cost;
  }

  get costSavedPerAsset(): number {
    return this._costSavedPerAsset;
  }

  set humanTime(time: number) {
    this._humanTime = time;
  }

  get humanTime(): number {
    return this._humanTime;
  }

  set humanCost(time: number) {
    this._humanCost = time;
  }

  get humanCost(): number {
    return this._humanCost;
  }

  set automationTime(time: number) {
    this._automationTime = time;
  }

  get automationTime(): number {
    return this._automationTime;
  }

  set automationCost(time: number) {
    this._automationCost = time;
  }

  get automationCost(): number {
    return this._automationCost;
  }

  static deserializer(): HttpResponseDeserializer<AutomationJob> {
    return new (class implements HttpResponseDeserializer<AutomationJob> {
      deserialize(httpResultType: HttpResultType): Optional<AutomationJob> {
        if (httpResultType) {
          let data = httpResultType.data;
          let automationJob = AutomationJob.toAutomationJob(data);
          return Optional.of(automationJob);
        }
        return Optional.empty();
      }
    })();
  }

  public static toAutomationJob(data: OBJECT_TYPE): AutomationJob {
    let automationJob = new AutomationJob();
    const jobExplore = data["job_explore"];
    if (jobExplore) {
      automationJob.hasAutomationDetails = true;
      const jobTimeDetails = jobExplore["job_time_details"];
      automationJob.elapsedTime = jobTimeDetails["elapsed_time"];
      automationJob.elapsedTimePerAsset = jobTimeDetails["time_per_asset"];

      const jobCostDetails = jobExplore["job_cost_details"];
      automationJob.costEstimate = jobCostDetails["cost_estimate"];
      automationJob.costPerAsset = jobCostDetails["cost_per_asset"];

      const jobCostSaved = jobExplore["job_savings"];
      automationJob.costSaved = jobCostSaved["saved"];
      automationJob.costSavedPerAsset = jobCostSaved["per_unit_savings"];

      const jobTimeEfficiency = jobExplore["job_time_efficiency"];
      automationJob.automationTime = jobTimeEfficiency["automation_time"];
      automationJob.humanTime = jobTimeEfficiency["human_time"];

      const jobCostEfficiency = jobExplore["job_cost_efficiency"];
      automationJob.automationCost = jobCostEfficiency["automation_cost"];
      automationJob.humanCost = jobCostEfficiency["human_cost"];
    }

    return automationJob;
  }
}

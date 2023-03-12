import CroppedDataSummaryResponse from "./CroppedDataSummaryResponse";
import HttpResponseDeserializer from "../util/web/http-response-deserializer";
import { HttpResultType } from "../util/web/http-client";
import Optional from "../util/Optional";
import _ from "lodash";
import { JSON_TYPE } from "../common/Types";

export default class SmartCroppedAssetsResultsResponse {
  private _total: number = 0;
  private _success_total = 0;
  private _failed_total = 0;
  private _croppedDataSummaries: Array<CroppedDataSummaryResponse> = [];
  private _nextPageToken: SmartCroppedAssetsNextPageToken | null = null;

  constructor() {}

  get total(): number {
    return this._total;
  }

  set total(value: number) {
    this._total = value;
  }

  get successTotal(): number {
    return this._success_total;
  }

  set successTotal(value: number) {
    this._success_total = value;
  }
  get failedTotal(): number {
    return this._failed_total;
  }

  set failedTotal(value: number) {
    this._failed_total = value;
  }

  get croppedDataSummaries(): Array<CroppedDataSummaryResponse> {
    return this._croppedDataSummaries;
  }

  set croppedDataSummaries(value: Array<CroppedDataSummaryResponse>) {
    this._croppedDataSummaries = value;
  }

  get nextPageToken(): SmartCroppedAssetsNextPageToken | null {
    return this._nextPageToken;
  }

  set nextPageToken(value: SmartCroppedAssetsNextPageToken | null) {
    this._nextPageToken = value;
  }

  static deserializer(): HttpResponseDeserializer<SmartCroppedAssetsResultsResponse> {
    return new (class implements HttpResponseDeserializer<SmartCroppedAssetsResultsResponse> {
      deserialize(httpResultType: HttpResultType): Optional<SmartCroppedAssetsResultsResponse> {
        const response = new SmartCroppedAssetsResultsResponse();
        if (httpResultType) {
          let summaries: CroppedDataSummaryResponse[] = [];
          const cropDataSummaries: Array<JSON_TYPE> = httpResultType.data["cropped_data_summaries"];
          if (!_.isEmpty(cropDataSummaries))
            summaries = cropDataSummaries.map(CroppedDataSummaryResponse.toCroppedDataSummaryResponse);
          const total = httpResultType.data["total"];
          const failed_total = httpResultType.data["failed_total"];
          const success_total = httpResultType.data["success_total"];

          response.croppedDataSummaries = summaries;
          response.total = total;
          response.failedTotal = failed_total;
          response.successTotal = success_total;
          const lastJobEntryJson = httpResultType.data["last_entry"];
          if (lastJobEntryJson) {
            const lastEntry = new SmartCroppedAssetsNextPageToken();
            lastEntry.lastJobId = lastJobEntryJson["job_id"];
            lastEntry.lastCropId = lastJobEntryJson["crop_id"];
            response.nextPageToken = lastEntry;
          }
        }
        return Optional.of(response);
      }
    })();
  }
}

export class SmartCroppedAssetsNextPageToken {
  public lastJobId: string = "";
  public lastCropId: string = "";
}

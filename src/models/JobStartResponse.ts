import HttpResponseDeserializer from "../util/web/http-response-deserializer";
import { HttpResultType } from "../util/web/http-client";
import Optional from "../util/Optional";

export default class JobStartResponse {
  private readonly _jobId: string;

  constructor(jobId: string) {
    this._jobId = jobId;
  }

  getJobId(): string {
    return this._jobId;
  }

  static deserializer(): HttpResponseDeserializer<JobStartResponse> {
    return new (class implements HttpResponseDeserializer<JobStartResponse> {
      deserialize(httpResultType: HttpResultType): Optional<JobStartResponse> {
        if (httpResultType) {
          const data = httpResultType.data;
          if (data) {
            return Optional.of(new JobStartResponse(data["job_id"]));
          }
        }
        return Optional.empty();
      }
    })();
  }
}

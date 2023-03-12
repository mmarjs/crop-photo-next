import HttpResponseDeserializer from "../util/web/http-response-deserializer";
import { HttpResultType } from "../util/web/http-client";
import Optional from "../util/Optional";
import AutomationItem from "./AutomationItem";
import { ArrayUtil } from "../ui-components/utils";

export default class AutomationListResponse {
  private readonly entries: AutomationItem[];
  private readonly n_entries: number;
  private readonly total_entries: number;

  constructor(nEntries: number, totalEntries: number, entries: AutomationItem[]) {
    this.entries = entries;
    this.n_entries = nEntries;
    this.total_entries = totalEntries;
  }

  getCurrentCount(): number {
    return this.n_entries;
  }

  getTotalCount(): number {
    return this.total_entries;
  }

  getAllEntries(): AutomationItem[] {
    return this.entries;
  }

  static deserializer(): HttpResponseDeserializer<AutomationListResponse> {
    return new (class implements HttpResponseDeserializer<AutomationListResponse> {
      deserialize(httpResultType: HttpResultType): Optional<AutomationListResponse> {
        if (httpResultType) {
          const entries = ArrayUtil.nullToEmpty(httpResultType.data["entries"]).map((value: any) =>
            AutomationItem.toAutomationItem(value)
          );
          const n_entries = httpResultType.data["n_entries"];
          const t_entries = httpResultType.data["total"];
          if (entries && entries.length > 0) {
            return Optional.of(new AutomationListResponse(n_entries, t_entries, entries as AutomationItem[]));
          }
        }
        return Optional.empty();
      }
    })();
  }
}

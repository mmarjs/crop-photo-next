import { AUTOMATION_STATUS } from "../common/Enums";
import HttpResponseDeserializer from "../util/web/http-response-deserializer";
import { HttpResultType } from "../util/web/http-client";
import Optional from "../util/Optional";
import { JSON_TYPE } from "../common/Types";
import type { Dayjs } from "dayjs";
import date from "../ui-components/utils/date";

export default class AutomationItem {
  private id!: string;
  private name!: string;
  private type!: string;
  private creationDate!: Dayjs;
  private status!: AUTOMATION_STATUS;
  private n_assets!: number;
  private n_results!: number;

  constructor() {}

  getAutomationId(): string {
    return this.id;
  }

  setAutomationId(value: string) {
    this.id = value;
  }
  getN_asset(): string | number {
    return this.n_assets;
  }

  setN_asset(value: number) {
    this.n_assets = value;
  }

  getN_results(): number {
    return this.n_results;
  }

  setN_results(value: number) {
    this.n_results = value;
  }

  getName(): string {
    return this.name;
  }

  setName(value: string) {
    this.name = value;
  }

  getType(): string {
    return this.type;
  }

  setType(value: string) {
    this.type = value;
  }

  getCreationDate(): Dayjs {
    return this.creationDate;
  }

  setCreationDate(value: Dayjs) {
    this.creationDate = value;
  }

  getStatus(): AUTOMATION_STATUS {
    return this.status;
  }

  setStatus(value: AUTOMATION_STATUS) {
    this.status = value;
  }

  isCompleted() {
    return this.status === AUTOMATION_STATUS.COMPLETED;
  }

  isRunning() {
    return this.status === AUTOMATION_STATUS.RUNNING;
  }

  isConfigured() {
    return this.status === AUTOMATION_STATUS.CONFIGURED;
  }

  isNotConfigured() {
    return this.status === AUTOMATION_STATUS.NOT_CONFIGURED;
  }

  static deserializer(): HttpResponseDeserializer<AutomationItem> {
    return new (class implements HttpResponseDeserializer<AutomationItem> {
      deserialize(httpResultType: HttpResultType): Optional<AutomationItem> {
        if (httpResultType) {
          let data = httpResultType.data;
          let automationItem = AutomationItem.toAutomationItem(data);
          return !!automationItem ? Optional.of(automationItem) : Optional.empty();
        }
        return Optional.empty();
      }
    })();
  }

  public static toAutomationItem(data: JSON_TYPE): AutomationItem | undefined {
    if (!data) return undefined;
    const id = data["id"];
    const name = data["name"];
    const creationDate = data["creation_date"];
    const type = data["type"];
    const status = data["status"];
    const n_assets = data["n_assets"];
    const n_results = data["n_results"];
    let automationItem = new AutomationItem();
    automationItem.setAutomationId(id);
    automationItem.setName(name);
    automationItem.setCreationDate(date(creationDate));
    automationItem.setType(type);
    automationItem.setStatus(status);
    automationItem.setN_asset(n_assets);
    automationItem.setN_results(n_results);
    return automationItem;
  }
}

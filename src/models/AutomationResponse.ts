import { SmartCropAutomationConfiguration } from "../ui-components/components/smart-crop-config/modal/CreateSmartCrop";
import Optional from "../util/Optional";
import { HttpResultType } from "../util/web/http-client";
import HttpResponseDeserializer from "../util/web/http-response-deserializer";
import AutomationItem from "./AutomationItem";
import { ArrayUtil } from "../ui-components/utils";
import {
  CustomFaceCropConfig,
  RemoveBgResizeConfig,
  UnrecognizableCropConfig
} from "../ui-components/smart-crop-components/jotai/atomTypes";

export default class AutomationResponse {
  private automation?: AutomationItem;
  private smart_crop_configuration?: SmartCropAutomationConfiguration;
  private remove_bg_resize_configuration?: RemoveBgResizeConfig;
  private unrecognizable_crop_configuration?: UnrecognizableCropConfig;
  private smart_crop_automation_configuration_v2?: CustomFaceCropConfig;
  private _automationJobIds: Array<string> = [];
  private _latestJobId: string = "";

  constructor() {}

  getRemoveBackground() {
    return this.smart_crop_configuration?.remove_background;
  }

  getAutomationJobIds(): Array<string> {
    return this._automationJobIds;
  }

  getLatestJobId(): string {
    return this._latestJobId;
  }

  getAutomationDetails() {
    return this.automation;
  }

  getAutomation() {
    return this.automation;
  }

  getAutomationJobId() {
    return this.automation?.getAutomationId();
  }

  getSmartCropConfigDetails() {
    return this.smart_crop_configuration;
  }

  getUnrecognizableCropConfigDetails(): UnrecognizableCropConfig | undefined {
    return this.unrecognizable_crop_configuration;
  }

  getRemoveBgResizeCropConfigDetails() {
    return this.remove_bg_resize_configuration;
  }

  getFaceCropConfigDetails() {
    return this.smart_crop_automation_configuration_v2;
  }

  getAutomationStatus() {
    return this.automation?.getStatus();
  }

  getCropType() {
    return this.smart_crop_configuration?.crop_type;
  }

  getCropSide() {
    return this.smart_crop_configuration?.crop_from_config?.crop_side;
  }

  getCropSize() {
    return this.smart_crop_configuration?.crop_from_config?.crop_side_values;
  }

  getMarker() {
    return this.smart_crop_configuration?.marker;
  }

  isIncludeMarkersBoundary() {
    if (this.smart_crop_configuration) {
      return this.smart_crop_configuration.crop_from_config?.include_markers_boundary;
    }
    return false;
  }

  setAutomationItem(automation: AutomationItem) {
    this.automation = automation;
  }

  static deserializer(): HttpResponseDeserializer<AutomationResponse> {
    return new (class implements HttpResponseDeserializer<AutomationResponse> {
      deserialize(httpResultType: HttpResultType): Optional<AutomationResponse> {
        if (httpResultType) {
          const data = httpResultType.data;
          if (data) {
            const automation = AutomationItem.toAutomationItem(data.automation);
            const smartCropConfiguration = data.smart_crop_automation_configuration_v2;
            const unrecognizableCropConfig = data?.unrecognizable_crop_configuration ?? undefined;
            const removeBgResizeConfig = data?.remove_bg_resize_configuration ?? undefined;
            const automationJobIds: string[] = ArrayUtil.nullToEmpty(data.automation_job_ids);
            const latestJobId = data.latest_job_id;
            const automationResponse = new AutomationResponse();
            automationResponse.automation = automation;
            automationResponse.smart_crop_automation_configuration_v2 = smartCropConfiguration;
            automationResponse._automationJobIds = automationJobIds;
            automationResponse._latestJobId = latestJobId;
            if (unrecognizableCropConfig) {
              automationResponse.unrecognizable_crop_configuration = unrecognizableCropConfig;
            }
            if (removeBgResizeConfig) {
              automationResponse.remove_bg_resize_configuration = removeBgResizeConfig;
            }
            return Optional.of(automationResponse);
          }
        }
        return Optional.empty();
      }
    })();
  }
}

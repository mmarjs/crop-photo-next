import { DownloadFormat, Parameters } from "../ui-components/smart-crop/select-format/select-format-utils";
import { ArrayUtil } from "../ui-components/utils";

class SmartCropDownloadOptions {
  public mediaConversionOptions: Array<DownloadFormat> = [];
  public parameters: Parameters = new Parameters();
}

export default class JobStartMessage {
  private readonly schema: number = 1;
  public readonly smartCropDownloadOptions: SmartCropDownloadOptions = new SmartCropDownloadOptions();

  constructor() {}

  public toJson() {
    return {
      schema: this.schema,
      smart_crop_download_options: {
        media_conversion_options: ArrayUtil.nullToEmpty(this.smartCropDownloadOptions.mediaConversionOptions).map(
          value => value.toJson()
        ),
        ...this.smartCropDownloadOptions.parameters.toJson()
      }
    };
  }
}

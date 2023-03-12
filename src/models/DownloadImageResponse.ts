import { JOB_STATUS } from "../common/Enums";
import { JSON_TYPE, OBJECT_TYPE } from "../common/Types";
import Optional from "../util/Optional";
import { HttpResultType } from "../util/web/http-client";
import HttpResponseDeserializer from "../util/web/http-response-deserializer";

export class DownloadMedia {
  private _s3DownloadSignedUrl!: string;
  private _downloadId!: string;
  private _jobStatus!: JOB_STATUS;
  private _downloadSize!: number;

  set s3DownloadSignedUrl(url: string) {
    this._s3DownloadSignedUrl = url;
  }

  get s3DownloadSignedUrl(): string {
    return this._s3DownloadSignedUrl;
  }

  set downloadId(url: string) {
    this._downloadId = url;
  }

  get downloadId(): string {
    return this._downloadId;
  }

  set jobStatus(status: JOB_STATUS) {
    this._jobStatus = status;
  }

  get jobStatus(): JOB_STATUS {
    return this._jobStatus;
  }

  set downloadSize(size: number) {
    this._downloadSize = size;
  }

  get downloadSize(): number {
    return this._downloadSize;
  }

  static toDownloadMediaJson(data: JSON_TYPE) {
    const dlMedia = new DownloadMedia();
    dlMedia.s3DownloadSignedUrl = data.s3_download_signed_url;
    dlMedia.downloadId = data["download_id"];
    dlMedia.jobStatus = data["job_status"];
    dlMedia.downloadSize = parseInt(data["size"]);
    return dlMedia;
  }
}

export default class DownloadImageResponse {
  private readonly _s3DownloadMedia: DownloadMedia;

  constructor(media: DownloadMedia) {
    this._s3DownloadMedia = media;
  }

  getS3DownloadedMedia(): DownloadMedia {
    return this._s3DownloadMedia;
  }

  static deserializer(): HttpResponseDeserializer<DownloadImageResponse> {
    return new (class implements HttpResponseDeserializer<DownloadImageResponse> {
      deserialize(httpResultType: HttpResultType): Optional<DownloadImageResponse> {
        if (httpResultType) {
          const data = httpResultType.data;

          if (data) {
            return Optional.of(new DownloadImageResponse(DownloadMedia.toDownloadMediaJson(data)));
          }
        }
        return Optional.empty();
      }
    })();
  }
}

export class DownloadImageToken {
  public automation_id!: string;
  public crop_ids: Array<string> = [];
  public automation_name?: string;
  public download_all?: boolean;
  public excluded_crop_ids?: Array<string> | null = null;
}

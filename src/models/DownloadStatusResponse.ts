import Optional from "../util/Optional";
import { HttpResultType } from "../util/web/http-client";
import HttpResponseDeserializer from "../util/web/http-response-deserializer";
import { DownloadMedia } from "./DownloadImageResponse";

export default class DownloadStatusResponse {
  private readonly _s3DownloadZippedMedia!: DownloadMedia;

  constructor(media: DownloadMedia) {
    this._s3DownloadZippedMedia = media;
  }

  getZippedMedia(): DownloadMedia {
    return this._s3DownloadZippedMedia;
  }

  static deserializer(): HttpResponseDeserializer<DownloadStatusResponse> {
    return new (class implements HttpResponseDeserializer<DownloadStatusResponse> {
      deserialize(httpResultType: HttpResultType): Optional<DownloadStatusResponse> {
        if (httpResultType) {
          const data = httpResultType.data;
          if (data) {
            return Optional.of(new DownloadStatusResponse(DownloadMedia.toDownloadMediaJson(data)));
          }
        }
        return Optional.empty();
      }
    })();
  }
}

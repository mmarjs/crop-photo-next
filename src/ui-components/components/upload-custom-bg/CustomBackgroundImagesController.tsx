import { Logger, Storage } from "aws-amplify";
import _ from "lodash";
import AuthenticationController from "../../../controller/AuthenticationController";
import { StringUtil } from "../../utils";

export default class CustomBackgroundImagesController {
  private readonly logger = new Logger("ui-components:upload-custom-bg:CustomBackgroundImagesController");
  private readonly CUSTOM_BG_TEMPLATE_DIR = _.template("_tenant_id/${tenant_id}/_automations/_assets/_custom-bg/");
  private tenantId: string = "";
  private _refresh: boolean = true;
  private backgroundImageEntries: string[] = [];

  public async loadBackgroundImages(): Promise<Array<string>> {
    if (this._refresh) {
      if (!this.tenantId) {
        this.tenantId = await AuthenticationController.fetchTenantId();
      }
      const path = this.CUSTOM_BG_TEMPLATE_DIR({ tenant_id: this.tenantId });
      let s3ProviderListOutputItems = await Storage.list(path, {
        customPrefix: {
          public: ""
        },
        maxKeys: 100
      });

      const keys = [];
      for (let i = 0; i < s3ProviderListOutputItems.length; i++) {
        let key = s3ProviderListOutputItems[i].key;
        if (key) {
          keys.push(key);
        }
      }
      keys.sort();
      this.backgroundImageEntries = keys;
      this._refresh = false;
    }
    return this.backgroundImageEntries;
  }

  setRefresh(value: boolean) {
    this._refresh = value;
  }

  async deleteFile(path: string) {
    await Storage.remove(path, {
      customPrefix: {
        public: ""
      }
    });
  }

  upload(file: File, progressCallback: (progress: number) => void) {
    let fileName = StringUtil.sanitizeForS3(file.name, "-");
    this.logger.debug("New sanitized file name",fileName)
    const url = this.CUSTOM_BG_TEMPLATE_DIR({tenant_id: this.tenantId}) + fileName;
    return Storage.put(url, file, {
      progressCallback: progress => {
        let progressPercentage = Math.round((progress.loaded / progress.total) * 100);
        progressCallback(progressPercentage);
      },
      customPrefix: {
        public: ""
      },
      resumable: false,
      metadata: {file_name: fileName},
      contentType: "image/jpeg"
    });
  }

  async signedUrl(path: string): Promise<string> {
    //https://docs.amplify.aws/lib/storage/download/q/platform/js/#get
    return await Storage.get(path, {
      customPrefix: {
        public: ""
      }
    });
  }
}

export class BackgroundImageEntry {
  /**
   * S3 Paths starts from s3://....
   */
  public s3Path: string;

  /**
   * S3 Signed URL.
   */
  public s3SignedUrl: string;
  /**
   * Relative path starts after bucket name. It doesn't include bucket name in it.
   */
  public relativePath: string;
  /**
   * File name;
   */
  public fileName: string;

  constructor(relativePath: string, s3SignedUrl: string) {
    this.relativePath = relativePath;
    this.s3Path = s3SignedUrl;
    this.s3SignedUrl = s3SignedUrl;
    this.fileName = StringUtil.getLastSubPath(this.relativePath, "/");
  }
}

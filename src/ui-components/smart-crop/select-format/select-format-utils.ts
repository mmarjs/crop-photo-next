import MediaSize from "../../../models/MediaSize";
import { t } from "i18next";
import _ from "lodash";

export enum CropConfigName {
  ORIGINAL = "ORIGINAL",
  INSTAGRAM = "INSTAGRAM",
  TWITTER = "TWITTER",
  FACEBOOK = "FACEBOOK",
  LINKEDIN = "LINKEDIN",
  PINTEREST = "PINTEREST",
  CUSTOM = "CUSTOM"
}

export function toEnumCropConfigName(v: string | undefined): CropConfigName | undefined {
  if (v) {
    let cropConfigNameElement = CropConfigName[v.toUpperCase() as keyof typeof CropConfigName];
    if (!cropConfigNameElement) {
      cropConfigNameElement = CropConfigName[v.toLowerCase() as keyof typeof CropConfigName];
    }
    return cropConfigNameElement;
  }
  return undefined;
}

export class Parameters {
  private _allowPadding: boolean = true;
  private _paddingColor: string = "#FFFFFF";
  private _transparency: number = 0;

  constructor() {}

  get allowPadding(): boolean {
    return this._allowPadding;
  }

  get paddingColor(): string {
    return this._paddingColor;
  }

  get transparency(): number {
    return this._transparency;
  }

  set allowPadding(isAllowed: boolean) {
    this._allowPadding = isAllowed;
  }

  set paddingColor(hex: string) {
    this._paddingColor = hex;
  }

  set transparency(alpha: number) {
    this._transparency = alpha;
  }

  toJson() {
    return {
      allow_padding: this._allowPadding,
      padding_color: this._paddingColor,
      transparency: this._transparency
    };
  }
}

export class DownloadFormat {
  private _configName: CropConfigName = CropConfigName.ORIGINAL;
  private _label: String = "";
  private _mediaSize!: MediaSize;
  private _id!: string;

  constructor(id: string | number, configName: CropConfigName, mediaSize: MediaSize | null = null) {
    this._configName = configName;
    if (mediaSize) {
      this._mediaSize = mediaSize;
    }
  }

  get configName(): CropConfigName {
    return this._configName;
  }

  set configName(value: CropConfigName) {
    this._configName = value;
  }

  set label(value: String) {
    this._label = value;
  }

  get mediaSize(): MediaSize {
    return this._mediaSize;
  }

  set mediaSize(value: MediaSize) {
    this._mediaSize = value;
  }

  toJson() {
    return {
      crop_config_name: this._configName,
      label: this._label,
      media_size: this._mediaSize ? this.mediaSize.toJson() : null
    };
  }
}

export class ImageSocialMediaFormats {
  private _title: string = t("media.social.media");
  private _formats: DownloadFormat[] = [];

  constructor() {}

  get title(): string {
    return this._title;
  }

  get formats(): DownloadFormat[] {
    return this._formats;
  }

  set title(value: string) {
    this._title = value;
  }

  set formats(value: DownloadFormat[]) {
    this._formats = value;
  }

  appendFormat(format: DownloadFormat): ImageSocialMediaFormats {
    this._formats.push(format);
    return this;
  }
}

export type SocialMediaFormatsType = { formats: DownloadFormat[]; title: string };

function nextRandom() {
  return _.random(5, true) + "";
}

export const SocialMediaFormats: SocialMediaFormatsType[] = [
  {
    title: "media.social_media",
    formats: [
      new DownloadFormat(nextRandom(), CropConfigName.INSTAGRAM, new MediaSize(1080, 1080)),
      new DownloadFormat(nextRandom(), CropConfigName.TWITTER, new MediaSize(1024, 512)),
      new DownloadFormat(nextRandom(), CropConfigName.FACEBOOK, new MediaSize(1200, 630)),
      new DownloadFormat(nextRandom(), CropConfigName.LINKEDIN, new MediaSize(1104, 736)),
      new DownloadFormat(nextRandom(), CropConfigName.PINTEREST, new MediaSize(600, 900))
    ]
  }
];

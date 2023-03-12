import { UploadItem } from "../common/Classes";

export default interface AssetState {
  onFinish(uploadItemList: UploadItem[]): void;

  onChange(): void;
}

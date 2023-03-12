import { UploadItem } from "../common/Classes";

export default interface AssetsView {
  getFiles(): UploadItem[];

  getTotal(): number;

  /**
   * Returns true if search is done on the server else false.
   * @param searchText
   */
  search(searchText: string): boolean;

  loadNextPage(): Promise<unknown>;

  delete(imageIds: string[], selectAll: boolean, ignoredForDelete: string[]): void;
}

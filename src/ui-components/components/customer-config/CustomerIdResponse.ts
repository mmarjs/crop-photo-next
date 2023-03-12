export default class CustomerIdResponse {
  private _customerId: string;
  private _isSuccess: boolean;

  constructor(entry: any) {
    this._customerId = entry.customer_id;
    this._isSuccess = entry.is_success;
  }

  get customerId(): string {
    return this._customerId;
  }

  set customerId(value: string) {
    this._customerId = value;
  }

  get isSuccess(): boolean {
    return this._isSuccess;
  }

  set isSuccess(value: boolean) {
    this._isSuccess = value;
  }
}

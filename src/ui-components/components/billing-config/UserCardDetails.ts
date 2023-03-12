import { StringUtil } from "../../utils";

export class UserCardDetails {
  private _cardType: string;
  private _last4Digits: string;
  private _cardExpiry: string;
  private _priceId: string;

  constructor(cardType?: string, last4Digits?: string, cardExpiry?: string, priceId?: string) {
    this._cardType = cardType ? cardType : "";
    this._last4Digits = last4Digits ? last4Digits : "";
    this._cardExpiry = cardExpiry ? cardExpiry : "";
    this._priceId = priceId ? priceId : "";
  }

  isEmpty() {
    return (
      StringUtil.isEmpty(this._cardType) &&
      StringUtil.isEmpty(this._last4Digits) &&
      StringUtil.isEmpty(this._cardExpiry) &&
      StringUtil.isEmpty(this._priceId)
    );
  }

  get cardType(): string {
    return this._cardType;
  }

  set cardType(value: string) {
    this._cardType = value;
  }

  get last4Digits(): string {
    return this._last4Digits;
  }

  set last4Digits(value: string) {
    this._last4Digits = value;
  }

  get cardExpiry(): string {
    return this._cardExpiry;
  }

  set cardExpiry(value: string) {
    this._cardExpiry = value;
  }

  get priceId(): string {
    return this._priceId;
  }

  set priceId(value: string) {
    this._priceId = value;
  }
}

export default class UserCardDetailsResponse {
  private _isSuccess: boolean;
  private _userCardDetails: UserCardDetails;

  constructor(entries: any) {
    this._isSuccess = entries.is_success;
    let cardDetails = entries.user_card_details;
    if (cardDetails != undefined) {
      this._userCardDetails = new UserCardDetails(
        cardDetails.card_type,
        cardDetails.last4_digits,
        cardDetails.expiry_date,
        cardDetails.price_id
      );
    } else this._userCardDetails = new UserCardDetails();
  }

  userCardDetailsIsEmpty() {
    return this._userCardDetails.isEmpty();
  }

  get isSuccess(): boolean {
    return this._isSuccess;
  }

  get userCardDetails(): UserCardDetails {
    return this._userCardDetails;
  }
}

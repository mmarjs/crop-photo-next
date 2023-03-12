import { CognitoUser, CognitoUserSession } from "amazon-cognito-identity-js";
import Optional from "../util/Optional";

export interface IAuthContext {
  user: () => Promise<Optional<UserDetails>>;
}

export class UserDetails {
  public cognito: CognitoUser | null = null;
  public email: string = "";
  public fullName: string = "";

  constructor(cognito: CognitoUser | null, email: string, fullName: string) {
    this.cognito = cognito;
    this.email = email;
    this.fullName = fullName;
  }
}

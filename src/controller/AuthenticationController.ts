import Auth, {CognitoHostedUIIdentityProvider} from "@aws-amplify/auth";
import {ICredentials} from "@aws-amplify/core";
import {CognitoIdToken, CognitoUser, CognitoUserSession, ISignUpResult} from "amazon-cognito-identity-js";
import {
  COGNITO_EMAIL_ATTRIBUTE_NAME,
  COGNITO_EMAIL_VERIFIED_ATTRIBUTE_NAME,
  COGNITO_FIRSTNAME_ATTRIBUTE_NAME,
  COGNITO_FULLNAME_ATTRIBUTE_NAME,
  COGNITO_IDENTITIES_ATTRIBUTE_NAME,
  COGNITO_TENANT_ID_ATTRIBUTE_NAME,
  COGNITO_USER_BOOTSTRAP_VERSION,
  CURRENT_BOOTSTRAP_VERSION
} from "../util/auth/Authenticator";
import API from "../util/web/api";
import TenantIdToUserIdToRole from "../models/TenantIdToUserIdToRole";
import Optional from "../util/Optional";
import {t} from "i18next";
import {Logger} from "aws-amplify";

export type PasswordValidationError = {
  isBlank: boolean;
  isCharCountNotValid: boolean;
  isSplCharCountNotValid: boolean;
  isUpperCaseCountNotValid: boolean;
  isLowerCaseCountNotValid: boolean;
  isDigitCountNotValid: boolean;
};

/**
 *
 */
export default class AuthenticationController {
  static logger: Logger = new Logger("controller:AuthenticationController");
  //Todo: After localization, remove all hard coded messages and exceptions.
  static PASSWORD_FORMAT_NOT_MATCH_ERR: string =
    "Password should be of minimum %d characters with %d special character(s), %d uppercase character(s), %d lowercase character(s) and %d numerical character(s).";
  static PASSWORD_MINIMUM_CHARACTER_COUNT_ERR: string = "Password should be of minimum %d characters.";
  static PASSWORD_MIN_SPL_CHARACTER_COUNT_ERR: string = "Password should have minimum %d special character(s).";
  static PASSWORD_MIN_UPPERCASE_CHARACTER_COUNT_ERR: string = "Password should have minimum %d uppercase character(s).";
  static PASSWORD_MIN_LOWERCASE_CHARACTER_COUNT_ERR: string = "Password should have minimum %d lowercase character(s).";
  static PASSWORD_MIN_DIGIT_CHARACTER_COUNT_ERR: string = "Password should have minimum %d digit(s).";
  static NO_AUTHENTICATED_USER_ERR: string = "No user is authenticated";
  static INVALID_TOKEN_ERR: string = "Unable to create new valid token. Please try login again.";
  static INVALID_SESSION_ERR: string = "Invalid Session. Please login and try again.";
  static PASSWORD_BLANK_ERR: string = "Password cannot be blank.";
  static EMAIL_BLANK_ERR: string = "Email cannot be blank.";
  static EMAIL_FROM_NON_VALID_DOMAIN_ERR: string = "Email from non-valid domains are not allowed.";
  static INVALID_EMAIL_ADDRESS: string = "Enter a valid email address";
  static SET_AND_GET_TENANT_ID_FAILED_ERR: string =
    "Fetching tenant id for the signed in user failed. Please contact support team.";
  static INVALID_FIRST_NAME = "Enter a valid first name";
  static INVALID_LAST_NAME = "Enter a valid last name";

  static PASSWORD_MIN_SPECIAL_CHARACTER_COUNT: number = 1;
  static PASSWORD_MIN_LOWERCASE_CHARACTER_COUNT: number = 1;
  static PASSWORD_MIN_UPPERCASE_CHARACTER_COUNT: number = 1;
  static PASSWORD_MINIMUM_CHARACTER_COUNT: number = 8;
  static PASSWORD_MIN_DIGIT_CHARACTER_COUNT: number = 1;
  static SPECIAL_CHARACTER_REGEX_PATTERN: RegExp = /^([@$#|<>{})(!%*?&.-])$/;
  static UPPERCASE_CHARACTER_REGEX_PATTERN: RegExp = /^([A-Z])$/;
  static DIGIT_CHARACTER_REGEX_PATTERN: RegExp = /^(\d)$/;
  static LOWERCASE_CHARACTER_REGEX_PATTERN: RegExp = /^([a-z])$/;

  static CHECK_AND_GET_DEFAULT_TENANT_API: string = "/api/v1/user/set-and-get-default-tenant";
  static PASSOWORD_REGEX_PATTERN: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  static EMAIL_REGEX_PATTERN: RegExp = /^[a-zA-Z0-9.!#$%&+'*\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  static FIRSTNAME_REGEX_PATTERN: RegExp = /^[a-zA-Z0-9,&\-\u00C0-\u017F.\s]+$/;
  static LASTNAME_REGEX_PATTERN: RegExp = AuthenticationController.FIRSTNAME_REGEX_PATTERN;
  static NON_VALID_EMAIL_DOMAINS: Array<string> = [""];
  static SSO_BUTTONS_LIST: Array<string> = ["google", "facebook", "amazon"];
  static SSO_AMAZON = "LoginWithAmazon";
  static SSO_APPLE = "SignInWithApple";
  static SSO_GOOGLE = "Google";
  static SSO_FACEBOOK = "Facebook";

  /**
   *
   * @param email
   * @returns
   */
  static validateEmail(email: string): boolean {
    return email != null && true && email.trim().length > 0 && AuthenticationController.EMAIL_REGEX_PATTERN.test(email);
  }

  /**
   *
   * @param email
   */
  static checkIfEmailIsFromNonValidDomain(email: string): boolean {
    let isValidDomain = true;
    if (AuthenticationController.NON_VALID_EMAIL_DOMAINS) {
      AuthenticationController.NON_VALID_EMAIL_DOMAINS.forEach(nonValidDomain => {
        if (nonValidDomain && nonValidDomain.length > 0 && email.endsWith(nonValidDomain)) {
          isValidDomain = false;
        }
      });
    }
    return isValidDomain;
  }

  /**
   *
   * @param email
   * @returns
   */
  static isValidEmail(email: string): boolean {
    return (
      AuthenticationController.validateEmail(email) && AuthenticationController.checkIfEmailIsFromNonValidDomain(email)
    );
  }

  static isLoginValuesValid(email: string, password: string): boolean {
    const {
      isBlank,
      isCharCountNotValid,
      isDigitCountNotValid,
      isLowerCaseCountNotValid,
      isSplCharCountNotValid,
      isUpperCaseCountNotValid
    } = this.validatePassword(password);
    const isValidPassword =
      !isBlank &&
      !isCharCountNotValid &&
      !isDigitCountNotValid &&
      !isLowerCaseCountNotValid &&
      !isSplCharCountNotValid &&
      !isUpperCaseCountNotValid;
    const isValidEmail = this.validateEmail(email);
    return isValidPassword && isValidEmail;
  }

  static isSignupValuesValid(firstName: string, lastName: string, email: string, password: string): boolean {
    const {
      isBlank,
      isCharCountNotValid,
      isDigitCountNotValid,
      isLowerCaseCountNotValid,
      isSplCharCountNotValid,
      isUpperCaseCountNotValid
    } = this.validatePassword(password);
    const isValidPassword =
      !isBlank &&
      !isCharCountNotValid &&
      !isDigitCountNotValid &&
      !isLowerCaseCountNotValid &&
      !isSplCharCountNotValid &&
      !isUpperCaseCountNotValid;
    const isValidFirstName = this.validateFirstName(firstName);
    const isValidLastName = this.validateLastName(lastName);
    const isValidEmail = this.validateEmail(email);
    return isValidFirstName && isValidLastName && isValidPassword && isValidEmail;
  }

  /**
   *
   * @param password
   * @returns
   */
  static validatePassword(password: string): PasswordValidationError {
    let splCharCount: number = 0;
    let upperCaseCharCount: number = 0;
    let lowerCaseCharCount: number = 0;
    let digitCount: number = 0;
    let charCount: number = 0;

    if (password && password.length > 0) {
      for (let i = 0; i < password.length; i++) {
        if (AuthenticationController.SPECIAL_CHARACTER_REGEX_PATTERN.test(password[i])) {
          splCharCount++;
        } else if (AuthenticationController.UPPERCASE_CHARACTER_REGEX_PATTERN.test(password[i])) {
          upperCaseCharCount++;
        } else if (AuthenticationController.LOWERCASE_CHARACTER_REGEX_PATTERN.test(password[i])) {
          lowerCaseCharCount++;
        } else if (AuthenticationController.DIGIT_CHARACTER_REGEX_PATTERN.test(password[i])) {
          digitCount++;
        }

        charCount++;
      }
    }

    return {
      isBlank: !(password && password.length > 0),
      isCharCountNotValid: charCount < AuthenticationController.PASSWORD_MINIMUM_CHARACTER_COUNT,
      isSplCharCountNotValid: splCharCount < AuthenticationController.PASSWORD_MIN_SPECIAL_CHARACTER_COUNT,
      isUpperCaseCountNotValid: upperCaseCharCount < AuthenticationController.PASSWORD_MIN_UPPERCASE_CHARACTER_COUNT,
      isLowerCaseCountNotValid: lowerCaseCharCount < AuthenticationController.PASSWORD_MIN_LOWERCASE_CHARACTER_COUNT,
      isDigitCountNotValid: digitCount < AuthenticationController.PASSWORD_MIN_DIGIT_CHARACTER_COUNT
    };
  }

  /**
   *
   * @param password
   */
  static isValidPassword(password: string): boolean {
    let validateResult = AuthenticationController.validatePassword(password);
    if (validateResult.isBlank) {
      throw new Error(AuthenticationController.PASSWORD_BLANK_ERR);
    }
    if (validateResult.isCharCountNotValid) {
      throw new Error(
        AuthenticationController.PASSWORD_MINIMUM_CHARACTER_COUNT_ERR.replace(
          "%d",
          AuthenticationController.PASSWORD_MINIMUM_CHARACTER_COUNT.toString()
        )
      );
    } else if (validateResult.isSplCharCountNotValid) {
      throw new Error(
        AuthenticationController.PASSWORD_MIN_SPL_CHARACTER_COUNT_ERR.replace(
          "%d",
          AuthenticationController.PASSWORD_MIN_SPECIAL_CHARACTER_COUNT.toString()
        )
      );
    } else if (validateResult.isUpperCaseCountNotValid) {
      throw new Error(
        AuthenticationController.PASSWORD_MIN_UPPERCASE_CHARACTER_COUNT_ERR.replace(
          "%d",
          AuthenticationController.PASSWORD_MIN_UPPERCASE_CHARACTER_COUNT.toString()
        )
      );
    } else if (validateResult.isLowerCaseCountNotValid) {
      throw new Error(
        AuthenticationController.PASSWORD_MIN_LOWERCASE_CHARACTER_COUNT_ERR.replace(
          "%d",
          AuthenticationController.PASSWORD_MIN_LOWERCASE_CHARACTER_COUNT.toString()
        )
      );
    } else if (validateResult.isDigitCountNotValid) {
      throw new Error(
        AuthenticationController.PASSWORD_MIN_DIGIT_CHARACTER_COUNT_ERR.replace(
          "%d",
          AuthenticationController.PASSWORD_MIN_DIGIT_CHARACTER_COUNT.toString()
        )
      );
    }

    return true;
  }

  /**
   *
   * @param firstName
   * @returns
   */
  static validateFirstName(firstName: string): boolean {
    return (
      firstName != null &&
      true &&
      firstName.trim().length > 0 &&
      AuthenticationController.FIRSTNAME_REGEX_PATTERN.test(firstName)
    );
  }

  /**
   *
   * @param lastName
   * @returns
   */
  static validateLastName(lastName: string): boolean {
    return (
      lastName != null &&
      true &&
      lastName.trim().length > 0 &&
      AuthenticationController.LASTNAME_REGEX_PATTERN.test(lastName)
    );
  }

  /**
   *
   * @param email
   * @param password
   * @param firstName
   * @param lastName
   * @param token
   */
  static async signUp(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    token: string
  ): Promise<ISignUpResult> {
    return await Auth.signUp({
      username: email,
      password: password,
      attributes: {
        email: email,
        name: firstName + " " + lastName,
        family_name: lastName,
        given_name: firstName
        // other custom attributes
      },
      validationData: {
        recaptcha_token: token
      }
    });
  }

  /**
   *
   * @param userId
   * @returns
   */
  static async resendSignUpCode(userId: string): Promise<any> {
    return await Auth.resendSignUp(userId);
  }

  /**
   *
   * @param userId
   * @param verificationCode
   * @returns
   */
  static async verifySignUp(userId: string, verificationCode: string): Promise<any> {
    return await Auth.confirmSignUp(userId, verificationCode);
  }

  /**
   *
   * @param username
   * @param password
   * @param token
   * @returns
   */
  static async signIn(username: string, password: string, token: string): Promise<CognitoUserSession> {
    return await AuthenticationController.cognitoSignIn(username, password, token);
  }

  /**
   *
   * @param provider
   * @returns
   */
  static async ssoSignIn(provider: string): Promise<any> {
    switch (provider) {
      case "facebook":
        return AuthenticationController.cognitoSSOLogin(CognitoHostedUIIdentityProvider.Facebook);
      case "amazon":
        return AuthenticationController.cognitoSSOLogin(CognitoHostedUIIdentityProvider.Amazon);
      case "google":
        return AuthenticationController.cognitoSSOLogin(CognitoHostedUIIdentityProvider.Google);
      case "apple":
        return AuthenticationController.cognitoSSOLogin(CognitoHostedUIIdentityProvider.Apple);
      default:
        return AuthenticationController.cognitoCustomSSOLogin(provider);
    }
  }

  /**
   *
   * @param globalSignOut
   * @throws NotAuthorizedException if session or cookie is already timed.
   */
  static async signOut(globalSignOut: boolean = false): Promise<any> {
    return Auth.signOut({ global: globalSignOut });
  }

  /**
   *
   * @param username
   * @param password
   * @param token
   */
  static async cognitoSignIn(username: string, password: string, token: string): Promise<CognitoUserSession> {
    this.logger.debug("token in signin func", token);
    const user: CognitoUser = await Auth.signIn(username, password, {
      captcha: token
    });
    if (user) {
      return await AuthenticationController.handleAuthenticationSuccess(user);
    } else {
      throw new Error(AuthenticationController.NO_AUTHENTICATED_USER_ERR);
    }
  }

  /**
   *
   * @param id
   */
  static async cognitoSSOLogin(id: CognitoHostedUIIdentityProvider): Promise<ICredentials> {
    return await Auth.federatedSignIn({ provider: id });
  }

  /**
   *
   * @param id
   */
  static async cognitoCustomSSOLogin(id: string): Promise<ICredentials> {
    return await Auth.federatedSignIn({ customProvider: id });
  }

  /**
   *
   * @returns
   */
  static async fetchCurrentAuthenticatedUser(): Promise<CognitoUser> {
    const user: CognitoUser = await Auth.currentAuthenticatedUser();
    if (user) {
      return user;
    } else {
      throw new Error(AuthenticationController.NO_AUTHENTICATED_USER_ERR);
    }
  }

  /**
   *
   * @param user
   * @returns
   */
  static fetchSessionFromUser(user: CognitoUser): Promise<CognitoUserSession> {
    return new Promise<CognitoUserSession>(async callback => {
      await user.getSession((errorObj: Error, session: CognitoUserSession | null) => {
        if (session) {
          callback(session);
        } else {
          throw errorObj;
        }
      });
    });
  }

  /**
   *
   * @returns
   */
  static async isUserAuthenticated(): Promise<boolean> {
    const user: CognitoUser | undefined = await AuthenticationController.fetchCurrentAuthenticatedUser();
    return AuthenticationController.isValidUser(user);
  }

  /**
   *
   * @returns
   */
  static isValidUser(user: CognitoUser): boolean {
    return user != null;
  }

  /**
   *
   * @param user
   */
  static async handleAuthenticationSuccess(user: CognitoUser): Promise<CognitoUserSession> {
    return new Promise(function (resolve, reject) {
      user.getSession((error: Error | null, session: CognitoUserSession | null) => {
        if (session) {
          AuthenticationController.checkAndGetValidSession(user, session).then(resolve).catch(reject);
        } else {
          reject(new Error(AuthenticationController.INVALID_SESSION_ERR));
        }
      });
    });
  }

  /**
   *
   * @param idToken
   * @returns
   */
  static checkIfTenantIdExistsInToken(idToken: CognitoIdToken): boolean {
    let isTokenValid = false;
    if (idToken) {
      const tenantId = idToken.payload[COGNITO_TENANT_ID_ATTRIBUTE_NAME];
      if (tenantId) {
        isTokenValid = true;
      }
    }
    return isTokenValid;
  }

  /**
   *
   * @param idToken
   * @returns
   */
  static isBootstrapNeeded(idToken: CognitoIdToken): boolean {
    let bootstrapNeeded = true;
    if (idToken) {
      const bsVersion = idToken.payload[COGNITO_USER_BOOTSTRAP_VERSION];
      if (bsVersion) {
        if (parseInt(bsVersion) === CURRENT_BOOTSTRAP_VERSION) {
          bootstrapNeeded = false;
        }
      }
    }
    return bootstrapNeeded;
  }

  /**
   *
   * @param idToken
   */
  static getUserEmailFromToken(idToken: CognitoIdToken): string {
    return idToken && idToken.payload[COGNITO_EMAIL_ATTRIBUTE_NAME]
      ? idToken.payload[COGNITO_EMAIL_ATTRIBUTE_NAME]
      : "";
  }

  static getTenantId(idToken: CognitoIdToken): string {
    return idToken && idToken.payload[COGNITO_TENANT_ID_ATTRIBUTE_NAME]
      ? idToken.payload[COGNITO_TENANT_ID_ATTRIBUTE_NAME]
      : "";
  }


  /**
   * Fetches the tenant id from current authenticated session.
   * Note: This is a costly operation. Do it if really needed and cache the value.
   * @returns Promise<string>
   */
  static async fetchTenantId() {
    let cognitoUser = await AuthenticationController.fetchCurrentAuthenticatedUser();
    const idToken = cognitoUser.getSignInUserSession()?.getIdToken();
    return idToken ? AuthenticationController.getTenantId(idToken) : "";
  }

  /**
   *
   * @param idToken
   */
  static isUserEmailVerified(idToken: CognitoIdToken): boolean {
    return idToken && idToken.payload[COGNITO_EMAIL_VERIFIED_ATTRIBUTE_NAME]
      ? idToken.payload[COGNITO_EMAIL_VERIFIED_ATTRIBUTE_NAME]
      : false;
  }

  /**
   *
   * @param user
   * @param session
   */
  static async checkAndGetValidSession(user: CognitoUser, session: CognitoUserSession): Promise<CognitoUserSession> {
    let isBootStrapNeeded = AuthenticationController.isBootstrapNeeded(session.getIdToken());
    let tenantIdExists = AuthenticationController.checkIfTenantIdExistsInToken(session.getIdToken());
    this.logger.debug("Bootstrap needed.", isBootStrapNeeded);
    if (isBootStrapNeeded) {
      this.logger.debug("In the isBootstrapNeeded if() block");
      //call api for tenant Id
      let resp: Optional<TenantIdToUserIdToRole> = await AuthenticationController.fetchUserTenantId();
      this.logger.debug("api call result is : ", resp);
      if (resp.isPresent()) {
        let tenantId = resp.get().getTenantId();
        if (tenantId && tenantId.length > 0) {
          let attributeUpdatedResult = await AuthenticationController.updateAttributes(user, [
            { Name: COGNITO_TENANT_ID_ATTRIBUTE_NAME, Value: tenantId },
            { Name: COGNITO_USER_BOOTSTRAP_VERSION, Value: CURRENT_BOOTSTRAP_VERSION + "" }
          ]);
          this.logger.debug("Attribute update result is : ", attributeUpdatedResult);
          if (await AuthenticationController.refreshSession({ byCachedCache: true })) {
            return await Auth.currentSession();
          }
        }
      }
      throw new Error(t("FAILED_TO_DETECT_TENANT_ID"));
    } else {
      this.logger.debug("New session not needed. Session is : ", session);
      return session;
    }
  }

  /**
   *
   * @param user
   * @param attributeName
   * @param attributeValue
   * @returns
   */
  static updateAttribute(user: CognitoUser, attributeName: string, attributeValue: string): Promise<string> {
    const attributes = [{ Name: attributeName, Value: attributeValue }];
    return this.updateAttributes(user, attributes);
  }

  private static updateAttributes(user: CognitoUser, attributes: { Value: string; Name: string }[]) {
    return new Promise<string>((resolve, reject) => {
      user.updateAttributes(attributes, function (err, text) {
        if (text) {
          resolve(text);
        } else {
          reject(err);
        }
      });
    });
  }

  /**
   *
   * @param user
   * @param session
   * @returns
   */
  static refreshCognitoSession(user: CognitoUser, session: CognitoUserSession): Promise<CognitoUserSession> {
    return new Promise<CognitoUserSession>(async callback => {
      user.refreshSession(session.getRefreshToken(), (err, session) => {
        if (session) {
          callback(session);
        } else {
          throw err;
        }
      });
    });
  }

  /**
   * Refreshes the current user token.
   */
  static refreshSession(options: { byCachedCache: boolean } = { byCachedCache: false }): Promise<boolean> {
    return new Promise(async (resolve) => {
      try {
        const cognitoUser: CognitoUser = await Auth.currentAuthenticatedUser({ bypassCache: options.byCachedCache });
        const currentSession = await Auth.currentSession();
        cognitoUser.refreshSession(
          currentSession.getRefreshToken(),
          (err, session) => {
            this.logger.debug("session", err, session);
            resolve(true);
          },
          {}
        );
      } catch (e) {
        console.warn("Unable to refresh Token", e);
        resolve(false);
      }
    });
  }

  /**
   *
   * @returns
   */
  static async fetchUserTenantId(): Promise<Optional<TenantIdToUserIdToRole>> {
    return await API.getOrSetTenantId();
  }

  /**
   *
   * @param email
   * @returns
   */
  static async forgotPassword(email: string): Promise<any> {
    return await Auth.forgotPassword(email);
  }

  /**
   *
   * @param userId
   * @param password
   * @param verificationCode
   * @returns
   */
  static async resetPassword(userId: string, password: string, verificationCode: string): Promise<string> {
    return await Auth.forgotPasswordSubmit(userId, verificationCode, password);
  }

  /**
   *
   * @param err
   * @returns
   */
  static checkIfUserNotConfirmedException(err: any): boolean {
    return err && err.name && err.name == "UserNotConfirmedException";
  }

  /**
   *
   * @param err
   * @returns
   */
  static checkIfUserNotFoundException(err: any): boolean {
    return false;
  }

  /**
   *
   * @param session
   */
  static getUserFullNameFromSession(session: CognitoUserSession | null): string {
    let fullName = "";
    if (session && session.getIdToken() && session.getIdToken().payload) {
      fullName = session.getIdToken().payload[COGNITO_FULLNAME_ATTRIBUTE_NAME];
    }
    return fullName;
  }

  static getUserFirstName(session: CognitoUserSession | null | undefined): string {
    if (session && session.getIdToken() && session.getIdToken().payload) {
      let payload = session.getIdToken().payload;
      const identities = payload[COGNITO_IDENTITIES_ATTRIBUTE_NAME];
      const providerName = !!identities ? payload[COGNITO_IDENTITIES_ATTRIBUTE_NAME][0].providerName : undefined;
      const isLoginWithAmazon = providerName ? providerName === AuthenticationController.SSO_AMAZON : false;
      const isLoginWithApple = providerName ? providerName === AuthenticationController.SSO_APPLE : false;

      if (isLoginWithAmazon && payload[COGNITO_FIRSTNAME_ATTRIBUTE_NAME]) {
        return payload[COGNITO_FIRSTNAME_ATTRIBUTE_NAME].split(" ")[0];
      } else if (isLoginWithApple && payload[COGNITO_FULLNAME_ATTRIBUTE_NAME]) {
        return payload[COGNITO_FULLNAME_ATTRIBUTE_NAME].split(" ")[0];
      } else if (!isLoginWithAmazon && payload[COGNITO_FIRSTNAME_ATTRIBUTE_NAME]) {
        return payload[COGNITO_FIRSTNAME_ATTRIBUTE_NAME];
      } else {
        return payload[COGNITO_FULLNAME_ATTRIBUTE_NAME];
      }
    }
    return t("Not Available");
  }
}

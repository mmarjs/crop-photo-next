import { CognitoIdToken, CognitoUserSession } from "amazon-cognito-identity-js";

export const HTTP_GET: string = "GET";
export const HTTP_POST: string = "POST";
export const TENANT_ID_DEFAULT_VALUE: string = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID_VALUE || "DefaultTenantId";
export const X_TENANT_ID_HEADER_NAME: string = "X-TENANT-ID";
export const COGNITO_TENANT_ID_ATTRIBUTE_NAME: string =
  process.env.NEXT_PUBLIC_COGNITO_TENANT_ID_ATTRIBUTE || "custom:tenant_id";
export const COGNITO_FULLNAME_ATTRIBUTE_NAME: string = process.env.NEXT_PUBLIC_COGNITO_FULLNAME_ATTRIBUTE || "name";
export const COGNITO_FIRSTNAME_ATTRIBUTE_NAME: string =
  process.env.NEXT_PUBLIC_COGNITO_FIRSTNAME_ATTRIBUTE || "given_name";
export const COGNITO_LASTNAME_ATTRIBUTE_NAME: string =
  process.env.NEXT_PUBLIC_COGNITO_LASTNAME_ATTRIBUTE || "family_name";
export const COGNITO_EMAIL_ATTRIBUTE_NAME: string = process.env.NEXT_PUBLIC_COGNITO_EMAIL_ATTRIBUTE || "email";
export const COGNITO_EMAIL_VERIFIED_ATTRIBUTE_NAME: string =
  process.env.NEXT_PUBLIC_COGNITO_EMAIL_VERIFIED_ATTRIBUTE || "email_verified";
export const COGNITO_IDENTITIES_ATTRIBUTE_NAME = "identities";
export const COGNITO_USER_BOOTSTRAP_VERSION: string = "custom:bs_v";
export const CURRENT_BOOTSTRAP_VERSION = 7;

export function POST(
  apiEndPoint: string,
  userSession: CognitoUserSession | null,
  params: Object | null
): Promise<Response> {
  return sendRequest(apiEndPoint, HTTP_POST, userSession, params);
}

export function GET(
  apiEndPoint: string,
  userSession: CognitoUserSession | null,
  params: Object | null
): Promise<Response> {
  return sendRequest(apiEndPoint, HTTP_GET, userSession, params);
}

function sendRequest(
  apiEndPoint: string,
  method: string,
  userSession: CognitoUserSession | null,
  params: Object | null
): Promise<Response> {
  let headers: Headers = new Headers();
  if (userSession) {
    const idToken: CognitoIdToken = userSession.getIdToken();
    const tenantId = idToken.payload[X_TENANT_ID_HEADER_NAME]
      ? idToken.payload[X_TENANT_ID_HEADER_NAME]
      : TENANT_ID_DEFAULT_VALUE;
    headers.append("Authorization", "Bearer " + idToken.getJwtToken());
    headers.append(X_TENANT_ID_HEADER_NAME, tenantId);
    headers.append("Content-Type", "application/json");
  }

  let options = <any>{ method, headers };
  if (params) {
    if (HTTP_GET === method) {
      // @ts-ignore
      apiEndPoint += "?" + new URLSearchParams(params).toString();
    } else {
      options.body = JSON.stringify(params);
    }
  }

  return fetch(apiEndPoint, { ...options });
}

export function getTenantIdAttributeName(): string {
  return toStringOr(COGNITO_TENANT_ID_ATTRIBUTE_NAME);
}

function toStringOr(v: any) {
  if (v) {
    return v;
  }
  throw new Error("Passed value(v) is null. It must not be.");
}

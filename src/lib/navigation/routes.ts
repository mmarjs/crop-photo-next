import { NextRouter } from "next/router";
import { OBJECT_TYPE } from "../../common/Types";

export const LOGIN_PAGE = "/user/login";
export const HOME_PAGE = "/";
export const LOGOUT_PAGE = "/user/logout";
export const SIGNUP_PAGE = "/user/signup";
export const VERIFY_SIGNUP_PAGE = "/user/verify-signup";
export const FORGOT_PASSWORD_PAGE = "/user/forgot-password";
export const RESET_PASSWORD_PAGE = "/user/reset-password";
export const BILLING_PAGE = "/user/billing";
export const SETTINGS_PAGE = "/user/settings";
export const SETTING_AND_BILLING_PAGE = "/user/settings/billing";
export const SETTING_AND_PROFILE_PAGE = "/user/settings/profile-and-security";
export const ALL_STATS_PAGE = "/user/settings/stats";
export const SETTING_AND_DATA_PAGE = "/user/settings/data";
export const CONFIGURATION_PAGE = "/configuration/selectmedia";
export const CONFIGURATION_AND_SELECT_MEDIA_PAGE = "/configuration/selectmedia";
export const PLANS_PAGE = "/user/settings/billing/plans";

/**
 * Tells whether current value is candidate for HREF or it is sub path of current domain.
 * @param value
 */
export function isHref(value: string): boolean {
  return value.startsWith("http");
}

export function redirectToPathWithParams(path: string, queryParams: OBJECT_TYPE, router: NextRouter, window: Window) {
  console.log("[route.ts] redirectToPath", path);
  if (isHref(path) && window) {
    window.location.href = path;
  } else {
    let query = router.query;
    router.push({ pathname: path, query: queryParams });
  }
}

export function redirectToPath(path: string, router: NextRouter, window: Window) {
  redirectToPathWithParams(path, {}, router, window);
}

export function redirectToApplication(router: NextRouter) {
  let redirectPath: string | string[] | undefined = router.query["redirect_path"];
  if (!redirectPath) {
    redirectPath = "/";
  }
  const path = redirectPath.toString();
  redirectToPath(path, router, window);
}

export function getQueryParam(paramName: string, defaultValue = null) {
  let params = new URLSearchParams(document.location.search);
  let value = params.has(paramName) ? params.get(paramName) : defaultValue;
  return value;
}

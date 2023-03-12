import React, { useCallback, useEffect, useState } from "react";
import Amplify, { Auth, Hub, Logger, Storage } from "aws-amplify";
import { HttpMethod, HttpResponse, RestClient } from "../../util/web/http-client";
import API from "../../util/web/api";
import ProblemJson from "../../util/web/problem-json";
import Optional from "../../util/Optional";
import FrontendRuntimeConfigResponse from "../../models/FrontendRuntimeConfigResponse";
import LocalStorage from "../../util/storage/LocalStorage";
import _ from "lodash";
import AuthenticationController from "../../controller/AuthenticationController";

const useLocalAuthProperties = false; //"true" === process.env.NEXT_PUBLIC_USE_LOCAL_AUTH_PROPERTIES;

const logger = new Logger("lib:cognito:CognitoAuthComponent", "DEBUG");

type AmplifyConfigurationProperties = {
  userPoolWebClientId?: string;
  awsRegion?: string;
  cookie: {
    path?: string;
    domain?: string;
    sameSite?: string;
    expiry?: number;
  };
  oauthDomain?: string;
  identityPoolId?: string;
  userPoolId?: string;
  storage?: {
    bucketName?: string;
  };
};

function getCognitoConfigProperties(): AmplifyConfigurationProperties {
  let expiry: string;
  if (process.env.NEXT_PUBLIC_COOKIE_EXPIRY) {
    expiry = process.env.NEXT_PUBLIC_COOKIE_EXPIRY;
  } else {
    expiry = "30";
  }
  return {
    identityPoolId: process.env.NEXT_PUBLIC_IDENTITY_POOL_ID,
    awsRegion: process.env.NEXT_PUBLIC_AWS_REGION,
    userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID,
    userPoolWebClientId: process.env.NEXT_PUBLIC_USER_POOL_WEBCLIENT_ID,
    oauthDomain: process.env.NEXT_PUBLIC_OAUTH_DOMAIN,
    cookie: {
      domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
      path: process.env.NEXT_PUBLIC_COOKIE_PATH,
      expiry: parseInt(expiry),
      sameSite: process.env.NEXT_PUBLIC_COOKIE_EXPIRY_SAME_SITE
    }
  };
}

const FRONT_END_RUNTIME_CONFIG_KEY = "frontend-runtime-config";

/*function getFrontendRuntimeConfigFromLocalStorage(): Optional<FrontendRuntimeConfigResponse> {
  let frontendRuntimeConfigString = LocalStorage.getItem(FRONT_END_RUNTIME_CONFIG_KEY);
  if (!!frontendRuntimeConfigString) {
    logger.debug("frontend-runtime-config values found in the local storage.");
    return Optional.of(FrontendRuntimeConfigResponse.deserializeObject(JSON.parse(frontendRuntimeConfigString)));
  }
  return Optional.empty();
}*/

function configureAmplify(cognitoConfigProperties: AmplifyConfigurationProperties): Promise<void> {
  return new Promise(function (resolve, reject) {
    const isLocalhost =
      window.location.hostname === "localhost" ||
      // [::1] is the IPv6 localhost address.
      window.location.hostname === "[::1]" ||
      // 127.0.0.1/8 is considered localhost for IPv4.
      window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/);
    let cookieDomain = isLocalhost ? "localhost" : cognitoConfigProperties.cookie.domain;
    const config = Amplify.configure({
      ssr: false,
      Auth: {
        // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
        identityPoolId: cognitoConfigProperties.identityPoolId,
        // REQUIRED - Amazon Cognito Region
        region: cognitoConfigProperties.awsRegion,
        // OPTIONAL - Amazon Cognito User Pool ID
        userPoolId: cognitoConfigProperties.userPoolId,
        // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
        userPoolWebClientId: cognitoConfigProperties.userPoolWebClientId,
        // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
        mandatorySignIn: true,
        // OPTIONAL - Configuration for cookie storage
        // Note: if the secure flag is set to true, then the cookie transmission requires a secure protocol
        cookieStorage: {
          // REQUIRED - Cookie domain (only required if cookieStorage is provided)
          domain: cookieDomain,
          // OPTIONAL - Cookie path
          path: cognitoConfigProperties.cookie.path,
          // OPTIONAL - Cookie expiration in days
          expires: cognitoConfigProperties.cookie.expiry,
          // OPTIONAL - See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
          sameSite: cognitoConfigProperties.cookie.sameSite, //"none",//"strict" | "lax",
          // OPTIONAL - Cookie secure flag // Either true or false, indicating if the cookie transmission requires a secure protocol (https).
          secure: true
        },
        // OPTIONAL - customized storage object
        //storage: MyStorage,

        // OPTIONAL - Manually set the authentication flow type. Default is 'USER_SRP_AUTH'
        //authenticationFlowType: 'USER_SRP_AUTH', //Not setting as default is USER_SRP_AUTH which is most secure.

        // OPTIONAL - Manually set key value pairs that can be passed to Cognito Lambda Triggers
        //clientMetadata: {myCustomKey: 'myCustomValue'},

        // OPTIONAL - Hosted UI configuration
        oauth: {
          domain: cognitoConfigProperties.oauthDomain,
          scope: ["email", "profile", "openid", "aws.cognito.signin.user.admin"],
          redirectSignIn: window.location.origin,
          redirectSignOut: window.location.origin + "/user/logout",
          responseType: "code" // or 'token', note that REFRESH token will only be generated when the responseType is code
        }
      },
      Storage: {
        AWSS3: {
          bucket: cognitoConfigProperties.storage?.bucketName, //REQUIRED -  Amazon S3 bucket name
          region: cognitoConfigProperties.awsRegion //OPTIONAL -  Amazon service region
        }
      }
    });
    logger.debug("After Amplify.configure", JSON.stringify(config));
    resolve();
  });
}

function updateConfigProperties(properties: AmplifyConfigurationProperties, response: FrontendRuntimeConfigResponse) {
  if (!useLocalAuthProperties) {
    logger.info(
      "Loading properties from remote frontend config. Because process.env.NEXT_PUBLIC_USE_LOCAL_AUTH_PROPERTIES is " +
        useLocalAuthProperties
    );
    properties.identityPoolId = response.cognitoIdentityPoolId;
    properties.userPoolId = response.cognitoUserPoolId;
    properties.awsRegion = response.awsRegion;
    properties.cookie.domain = response.cookieDomain;
    properties.oauthDomain = response.cognitoUserPoolOAuthDomainURL;
    properties.userPoolWebClientId = response.cognitoDefaultUserPoolClientId;
    properties.storage = { bucketName: response.assetStorageBucketName };
  } else {
    logger.warn(
      "Not loading properties from remote frontend config. Because process.env.NEXT_PUBLIC_USE_LOCAL_AUTH_PROPERTIES is " +
        useLocalAuthProperties
    );
  }
}

/*function saveFrontConfigInLocalStorage(value: FrontendRuntimeConfigResponse) {
  LocalStorage.setItem(FRONT_END_RUNTIME_CONFIG_KEY, FrontendRuntimeConfigResponse.serialize(value));
  logger.debug("Saved the frontend runtime config to localstorage.", value);
}*/

/*function clearFrontConfigInLocalStorage() {
  LocalStorage.removeItem(FRONT_END_RUNTIME_CONFIG_KEY);
  logger.debug("Cleared frontend runtime config from localstorage.");
}*/

function applyConfigAndConfigureAmplify(
  cognitoConfigProperties: AmplifyConfigurationProperties,
  response: FrontendRuntimeConfigResponse
) {
  updateConfigProperties(cognitoConfigProperties, response);
  configureAmplify(cognitoConfigProperties).then(_.noop);
}

function CognitoAuthComponent(props: any) {
  const [awsConfigured, setAwsConfigured] = useState<boolean>(false);

  function onAmplifyConfigureDone() {
    // Auth.currentAuthenticatedUser().then(function (rv) {
    //   setAwsConfigured(true);
    // }).catch(function (error) {
    //   setAwsConfigured(true);
    // });
    logger.debug("Amplify configuration done.");
  }

  useEffect(() => {
    const listener = (data: any) => {
      switch (data.payload.event) {
        case "signIn":
          logger.info("user signed in");
          break;
        case "signUp":
          logger.info("user signed up");
          break;
        case "signOut":
          logger.info("user signed out");
          break;
        case "signIn_failure":
          logger.error("user sign in failed");
          break;
        case "tokenRefresh":
          logger.info("token refresh succeeded");
          break;
        case "tokenRefresh_failure":
          logger.error("token refresh failed");
          break;
        case "configured":
          logger.info("the Auth module is configured");
          setAwsConfigured(true);
          break;
      }
    };

    Hub.listen("auth", listener);
    return () => Hub.remove("auth", listener);
  }, []);

  useEffect(() => {
    let cognitoConfigProperties = getCognitoConfigProperties();
    logger.debug("Before cognitoConfigProperties", JSON.stringify(cognitoConfigProperties));
    if (useLocalAuthProperties) {
      logger.debug(
        "Use useLocalAuthProperties is true. So, not going to load the properties from backend for cognito."
      );
      configureAmplify(cognitoConfigProperties).then(_.noop);
      onAmplifyConfigureDone();
    } else {
      let applyConfig = (frontendRuntimeConfigResponse: FrontendRuntimeConfigResponse) => {
        applyConfigAndConfigureAmplify(cognitoConfigProperties, frontendRuntimeConfigResponse);
        onAmplifyConfigureDone();
      };

      let fetchConfigFromBackend = () => {
        logger.debug("Fetching frontend runtime config from backend.");
        API.getFrontendRuntimeConfig()
          .then((value: Optional<FrontendRuntimeConfigResponse>) => {
            if (value.isPresent()) {
              //saveFrontConfigInLocalStorage(value.get());
              applyConfig(value.get());
            } else {
              logger.error("Failed to fetch frontend runtime config.", value);
            }
          })
          .catch((error: ProblemJson) => {
            //Todo: @om, handle this error. We can show the error on the screen.
            logger.debug("Failed to fetch frontend runtime config.", error.detail);
            logger.error(error.detail, error);
            configureAmplify(cognitoConfigProperties).then(_.noop);
            onAmplifyConfigureDone();
          });
      };
      fetchConfigFromBackend();
    }
  }, []);
  return awsConfigured ? props.children : null;
}

export default CognitoAuthComponent;

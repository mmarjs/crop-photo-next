import {datadogRum} from "@datadog/browser-rum";
import {datadogLogs} from "@datadog/browser-logs";
import {Logger} from "aws-amplify";

const logger = new Logger("datadogInitialize");

export function getEnv() {
  if (typeof window !== "undefined") {
    if (window && window.location) {
      const hostname = window.location.hostname.toLowerCase().trim();
      logger.debug("hostname", hostname);
      if (hostname === "app.crop.photo" || hostname === "app.prod.crop.photo") {
        return "prod";
      } else if (hostname === "app.beta.crop.photo") {
        return "beta";
      } else if (hostname === "app.dev.crop.photo") {
        return "dev";
      } else if (hostname === "app.daisy.crop.photo") {
        return "daisy";
      } else if (hostname === "localhost" || hostname === "127.0.0.1") {
        return "local-dev";
      } else {
        if (hostname.startsWith("app.") && hostname.endsWith(".crop.photo")) {
          const split = hostname.split(".");
          if (split) {
            if (split.length > 1) {
              return split[1];
            }
          }
        }
      }
    }
    logger.debug("Unknown host name for datadog logging. hostname:", window.location.hostname);
  }
  return "unknown-host";
}

let env = getEnv();
let applicationId: string;
let clientToken: string;
let service: string;

if (env === "daisy") {
  applicationId = process.env.NEXT_PUBLIC_DATADOG_RUM_APPLICATION_ID_DAISY as string;
  clientToken = process.env.NEXT_PUBLIC_DATADOG_RUM_CLIENT_TOKEN_DAISY as string;
  service = "app.daisy.crop";
} else if (env === "beta") {
  applicationId = process.env.NEXT_PUBLIC_DATADOG_RUM_APPLICATION_ID_BETA as string;
  clientToken = process.env.NEXT_PUBLIC_DATADOG_RUM_CLIENT_TOKEN_BETA as string;
  service = "app.beta.crop";
} else if (env === "prod") {
  applicationId = process.env.NEXT_PUBLIC_DATADOG_RUM_APPLICATION_ID_PROD as string;
  clientToken = process.env.NEXT_PUBLIC_DATADOG_RUM_CLIENT_TOKEN_PROD as string;
  service = "app.prod.crop";
}

export const getStripePublishableKey = () => {
  let env = getEnv();
  switch (env) {
    case "daisy":
      return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_ID_DAISY as string;
    case "dev":
      return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_ID_DEV as string;
    case "beta":
      return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_ID_BETA as string;
    case "prod":
      return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_ID_PROD as string;
    case "local-dev":
      return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_ID_TEST as string;
  }
};

export const initializeDatadog = () => {
  if (process.env.NODE_ENV === "production") {
    datadogRum.init({
      applicationId: applicationId,
      clientToken: clientToken,
      site: "datadoghq.com",
      service: service,
      // Specify a version number to identify the deployed version of your application in Datadog
      version: process.env.BUILD_VERSION,
      sampleRate: 100,
      trackInteractions: true,
      defaultPrivacyLevel: "mask-user-input",
      trackSessionAcrossSubdomains: true,
      env: env
    });

    logger.debug("Datalog RUM setup done :", env, "Tokens present: ", applicationId, clientToken);
    datadogRum.startSessionReplayRecording();
  }
};

export const initializeDatadogLogs = () => {
  if (process.env.NODE_ENV === "production") {
    datadogLogs.init({
      clientToken: clientToken,
      site: "datadoghq.com",
      forwardErrorsToLogs: true,
      service: service,
      sampleRate: 100,
      env: getEnv(),
      trackSessionAcrossSubdomains: true
    });
    const env = getEnv();
    logger.debug("Datalog log setup done for:", env, "Tokens present: ", !!applicationId, !!clientToken);
  }
};

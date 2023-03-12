import { useMemo } from "react";

enum Environments {
  DAISY = "daisy",
  DEV = "dev",
  BETA = "beta",
  LOCAL = "localhost"
}

enum BaseURLs {
  BETA = "https://beta.crop.photo",
  PRODUCTION = "https://crop.photo"
}

// const buildEnv = process.env.BUILD_ENV;

export default function useHomepageBaseURL(host: string): string {
  return useMemo(() => {
    return host.includes(Environments.DEV) ||
      host.includes(Environments.DAISY) ||
      host.includes(Environments.BETA) ||
      host.includes(Environments.LOCAL)
      ? BaseURLs.BETA
      : BaseURLs.PRODUCTION;
  }, [host]);
}

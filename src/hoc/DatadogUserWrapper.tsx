import { datadogRum } from "@datadog/browser-rum";
import React, { ReactNode, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import Optional from "../util/Optional";
import { UserDetails } from "../context/IAuthContext";
import { datadogLogs } from "@datadog/browser-logs";
import { getEnv } from "../../datadogInitialize";
import { OBJECT_TYPE } from "../common/Types";

function setupDatadog(value: Optional<UserDetails>) {
  let env: string = getEnv();
  let optionalParams: OBJECT_TYPE;
  if (env === "prod") {
    optionalParams = { id: value.get().cognito?.getUsername() };
  } else {
    optionalParams = {
      name: value.get().fullName,
      email: value.get().email,
      id: value.get().cognito?.getUsername()
    };
  }
  datadogRum.setUser(optionalParams);
  datadogLogs.addLoggerGlobalContext("user_id", value.get().cognito?.getUsername());
}

const DatadogUserWrapper = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  //Add user info to datadog
  useEffect(() => {
    user().then((value: Optional<UserDetails>) => {
      if (value.isPresent()) {
        setupDatadog(value);
      }
    });
  }, [user]);

  return <>{children}</>;
};

export default DatadogUserWrapper;

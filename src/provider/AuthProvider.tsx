import { ReactNode, useCallback, useEffect, useState } from "react";
import { CognitoUser } from "amazon-cognito-identity-js";
import Auth from "@aws-amplify/auth";
import AuthContext from "../context/AuthContext";
import { useIntercom } from "react-use-intercom";
import AuthenticationController from "../controller/AuthenticationController";
import { Logger } from "aws-amplify";
import { useRouter } from "next/router";
// import { useAuthenticator } from "@aws-amplify/ui-react";
import { UserDetails } from "../context/IAuthContext";
import Optional from "../util/Optional";
import API from "../util/web/api";
import { OBJECT_TYPE } from "../common/Types";
import { FlagsProvider } from "../util/feature-flag";

const logger = new Logger("provider:AuthProvider");

function isValidSession(user: CognitoUser | null) {
  return user && user.getSignInUserSession() ? user.getSignInUserSession()?.isValid() : false;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // const { user } = useAuthenticator(context => [context.user]);
  const [cognitoUser, setCognitoUser] = useState<CognitoUser | null>(null);
  const { update: updateIntercom } = useIntercom();
  let [email, setEmail] = useState("");
  let [fullName, setFullName] = useState("");
  let [authLoading, setAuthLoading] = useState(false);
  const [appConfig, setAppConfig] = useState<OBJECT_TYPE>();
  //We want to skip the auth cache when loading first time.

  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: URL, options: { shallow: boolean }) => {
      logger.debug(`App is changing to ${url} ${options.shallow ? "with" : "without"} shallow routing`);
      if (!authLoading) {
        setAuthLoading(true);
        obtainAndSetUser()
          .then(() => {})
          .catch(() => {})
          .finally(() => {
            setAuthLoading(false);
          });
      }
    };
    router.events.on("routeChangeStart", handleRouteChange);
    // If the component is unmounted, unsubscribe
    // from the event with the `off` method:
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, []);

  useEffect(() => {
    if (cognitoUser?.getUsername()) {
      API.getAppConfig()
        .then(response => {
          //set the response to app config here
          console.log("AppConfig response", response);
          // setAppConfig(response.data)
          setAppConfig(response.data.config.configuration);
        })
        .catch(e => {
          console.log("AppConfig Error", e);
        });
    }
  }, [cognitoUser?.getUsername()]);

  function currentAuthenticatedUser(bypassCache = false): Promise<CognitoUser | null> {
    return Auth.currentAuthenticatedUser({ bypassCache: bypassCache })
      .then((user: CognitoUser) => {
        let validSession = isValidSession(user);
        logger.debug(
          `User loaded: ${user.getUsername()} with bypass cache: ${bypassCache}  valid session: ${validSession}`
        );
        return user;
      })
      .catch(error => {
        logger.warn("Error in loading current user:", error);
        //Throwing error again after logging the error. Do not return the error from here, returned values from catch goes as resolved values in the called.
        throw error;
      });
  }

  const obtainUser: () => Promise<CognitoUser | null> = useCallback(() => {
    let promise: Promise<CognitoUser | null> = new Promise((resolve, reject) => {
      currentAuthenticatedUser()
        .then((user: CognitoUser | null) => {
          let validSession = isValidSession(user);
          if (!validSession) {
            currentAuthenticatedUser(true)
              .then(resolve)
              .catch(() => resolve(null));
          } else {
            resolve(user);
          }
        })
        .catch(error => {
          resolve(null);
        });
    });
    promise = new Promise((resolve, reject) => {
      promise.then((user: CognitoUser | null) => {
        if (user) {
          const signInUserSession = user.getSignInUserSession();
          if (signInUserSession) {
            AuthenticationController.checkAndGetValidSession(user, signInUserSession)
              .then(() => {
                resolve(user);
              })
              .catch(error => {
                console.error(error);
                resolve(null);
              });
          }
          //AuthenticationController.checkIfTenantIdExistsInToken(user.))
        }
        resolve(user);
      });
    });
    return promise;
  }, []);

  function obtainAndSetUser() {
    return obtainUser().then(cognitoUser => {
      let email: string = "";
      let fullName: string = "";
      if (cognitoUser) {
        if (cognitoUser) {
          const signInUserSession = cognitoUser.getSignInUserSession();
          if (signInUserSession) {
            email = AuthenticationController.getUserEmailFromToken(signInUserSession.getIdToken());
            fullName = AuthenticationController.getUserFullNameFromSession(signInUserSession);
          }
        }
      }
      setCognitoUser(cognitoUser);
      setFullName(fullName);
      setEmail(email);
      setAuthLoading(false);
    });
  }

  // useEffect(() => {
  //   logger.debug("Running useEffect. Deps:", JSON.stringify([email, router.pathname]));
  //   setAuthLoading(true);
  //   if (authLoading) {
  //     obtainAndSetUser();
  //   }
  //   //We want to run the effect on path change, so that we can obtain the user again.
  //   // eslint-disable-next-line
  // }, [router.pathname]);

  useEffect(() => {
    if (email && fullName) {
      updateIntercom({
        name: fullName,
        email: email ? email : undefined,
        verticalPadding: 30
      });
    }
    // eslint-disable-next-line
  }, [cognitoUser, email, fullName]);

  const onUser: () => Promise<Optional<UserDetails>> = useCallback(() => {
    return new Promise(resolve => {
      if (cognitoUser) {
        resolve(Optional.of(new UserDetails(cognitoUser, email, fullName)));
      } else {
        obtainUser().then(cognitoUser => {
          setCognitoUser(cognitoUser);
          if (cognitoUser) resolve(Optional.of(new UserDetails(cognitoUser, email, fullName)));
          else resolve(Optional.empty());
        });
      }
    });
    // eslint-disable-next-line
  }, [cognitoUser]);

  // return <AuthContext.Provider
  //   value={{user, signOut, email, fullName}}>{route != 'idle' ? children : null}</AuthContext.Provider>;
  return (
    <AuthContext.Provider value={{ user: onUser }}>
      <FlagsProvider features={appConfig}>{children}</FlagsProvider>
    </AuthContext.Provider>
  );
}

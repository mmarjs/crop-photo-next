import type { AppProps, NextWebVitalsMetric } from "next/app";
import CognitoAuthComponent from "../lib/cognito/cognito-auth-component";
import { AuthProvider } from "../provider/AuthProvider";
import { wrapper } from "../redux/store";
import { initializeDatadog, initializeDatadogLogs } from "../../datadogInitialize";
import { IntercomProvider } from "react-use-intercom";
import "antd/dist/reset.css";
import "../styles/globals.css";
import "../lib/i18n/i18n";
import Amplify from "aws-amplify";
import DatadogUserWrapper from "../hoc/DatadogUserWrapper";
import Head from "next/head";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../util/web/react-query";
import { Provider } from "jotai";

if (typeof window !== "undefined") {
  // Client-side-only code
  initializeDatadog();
  initializeDatadogLogs();
}
Amplify.Logger.LOG_LEVEL = "DEBUG";
const INTERCOM_ID = process.env.NEXT_PUBLIC_INTERCOM_APP_ID || "";
const API_BASE = "https://api-iam.intercom.io";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>crop.photo</title>
      </Head>
      <QueryClientProvider client={queryClient}>
        <Provider>
          <CognitoAuthComponent>
            <IntercomProvider appId={INTERCOM_ID} apiBase={API_BASE} autoBoot>
              {/*<Authenticator.Provider>*/}
              <AuthProvider>
                <DatadogUserWrapper>
                  <Component {...pageProps} />
                </DatadogUserWrapper>
              </AuthProvider>
              {/*</Authenticator.Provider>*/}
            </IntercomProvider>
          </CognitoAuthComponent>
        </Provider>
        {/* <ReactQueryDevtools /> */}
      </QueryClientProvider>
    </>
  );
}

// Only uncomment this method if you have blocking data requirements for
// every single page in your application. This disables the ability to
// perform automatic static optimization, causing every page in your app to
// be server-side rendered.
//
// MyApp.getInitialProps = async (appContext: AppContext) => {
//   // calls page's `getInitialProps` and fills `appProps.pageProps`
//   const appProps = await App.getInitialProps(appContext);

//   return { ...appProps }
// }

// noinspection JSUnusedGlobalSymbols

export function reportWebVitals(metric: NextWebVitalsMetric) {
  //console.log(metric)
}

export default wrapper.withRedux(MyApp);

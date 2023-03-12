import AXIOS, { AxiosRequestConfig, AxiosResponse, CancelToken, CancelTokenSource, ResponseType } from "axios";
import { format, parse } from "url";
import { Credentials, ICredentials } from "@aws-amplify/core";
import { CognitoUser, CognitoUserSession } from "amazon-cognito-identity-js";
import Amplify, { Auth, Logger } from "aws-amplify";
import { getTenantIdAttributeName, X_TENANT_ID_HEADER_NAME } from "../auth/Authenticator";
import HttpResponseDeserializer from "./http-response-deserializer";
import { ProblemJson } from "./problem-json";
import { ProblemJsonException } from "../exception/problem-json-exception";
import Optional from "../Optional";
import { JSON_TYPE } from "../../common/Types";
import Router from "next/router";
import { LOGIN_PAGE } from "../../lib/navigation/routes";

//We are using a new instance of axios as AWS also uses axios.
//We are adding the axios interceptor to catch the global errors.
//If we add the interceptor in the main axios object, our code catches all the errors, which we don't want
// as AWS Amplify is also using axios and theirs errors start to come in our core.
//So, we are creating a new instance of axios.
//See: https://axios-http.com/docs/interceptors
const axios = AXIOS;

export interface RestClientOptions {
  /*headers: object;
  endpoints: object;
  credentials?: object;*/
}

export type ApiInfo = {
  endpoint: string;
  custom_header?: () => { [key: string]: string };
};

export type InitOptions = {
  headers?: { [p: string]: any };
  body?: FormData | { [p: string]: any };
  queryStringParameters?: {};
  responseType?: ResponseType;
  withCredentials?: boolean;
};

interface IRestClient {
  ajax(urlOrApiInfo: string | ApiInfo, method: "GET" | "POST", init: InitOptions): Promise<AxiosResponse | void>;

  /**
   * Cancel an inflight API request
   * @param {Promise<any>} request - The request promise to cancel
   * @param {string} [message] - A message to include in the cancelation exception
   */
  cancel(request: Promise<any>, message?: string): void;

  /**
   * Checks to see if an error thrown is from an api request cancellation
   * @param {any} error - Any error
   * @return {boolean} - A boolean indicating if the error was from an api request cancellation
   */
  isCancel(error: any): boolean;
}

export class RestClient implements IRestClient {
  private _options: RestClientOptions;
  private _cancelTokenMap: WeakMap<any, CancelTokenSource>;
  readonly logger: Logger = new Logger("util.auth.RestClient");

  constructor(options: RestClientOptions) {
    this._options = options;
    this._cancelTokenMap = new WeakMap();
  }

  async ajax(urlOrApiInfo: string | ApiInfo, method: HttpMethod, init: InitOptions): Promise<AxiosResponse> {
    let url: string;
    let custom_header: (() => { [p: string]: string }) | undefined = undefined;

    const cancellableToken = RestClient.getCancellableToken();

    if (typeof urlOrApiInfo === "string") {
      url = urlOrApiInfo;
    } else {
      url = urlOrApiInfo.endpoint;
      custom_header = urlOrApiInfo.custom_header;
    }

    const params: AxiosRequestConfig = {
      method,
      url,
      headers: {},
      data: null,
      responseType: "json",
      timeout: 0,
      cancelToken: cancellableToken.token
    };

    let libraryHeaders: { [p: string]: any } = {
      "Content-Type": "application/json; charset=UTF-8"
    };

    const initParams = Object.assign({}, init);

    const isAllResponse = true;
    if (initParams.body) {
      if (typeof FormData === "function" && initParams.body instanceof FormData) {
        libraryHeaders["Content-Type"] = "multipart/form-data";
        params.data = initParams.body;
      } else {
        libraryHeaders["Content-Type"] = "application/json; charset=UTF-8";
        params.data = JSON.stringify(initParams.body);
      }
    }

    if (initParams.responseType) {
      params.responseType = initParams.responseType;
    }
    if (initParams.withCredentials) {
      params["withCredentials"] = initParams.withCredentials;
    }
    /*if (initParams.timeout) {
      params.timeout = initParams.timeout;
    }*/
    if (cancellableToken) {
      params.cancelToken = cancellableToken.token;
    }

    // custom_header callback
    const custom_header_obj = typeof custom_header === "function" ? custom_header() : undefined;

    params.headers = {
      ...libraryHeaders,
      ...custom_header_obj,
      ...initParams.headers
    };

    // Intentionally discarding search
    if (initParams.queryStringParameters) {
      initParams.queryStringParameters = Object.fromEntries(
        Object.entries(initParams.queryStringParameters).filter(([key, value]) => !!value)
      );
    }
    const { search, ...parsedUrl } = parse(url, true, true);
    params.url = format({
      ...parsedUrl,
      query: {
        ...parsedUrl.query,
        ...(initParams.queryStringParameters || {})
      }
    });

    this.logger.debug("Sending REST request with params: ", params);
    const promise: Promise<AxiosResponse> = this._request(params, isAllResponse);

    this.updateRequestToBeCancellable(promise, cancellableToken);
    return promise;
  }

  /**
   * Cancel an inflight API request
   * @param {Promise<any>} request - The request promise to cancel
   * @param {string} [message] - A message to include in the cancelation exception
   */
  cancel(request: Promise<any>, message?: string) {
    const source = this._cancelTokenMap.get(request);
    if (source) {
      source.cancel(message);
    }
  }

  /**
   * Checks to see if an error thrown is from an api request cancellation
   * @param {any} error - Any error
   * @return {boolean} - A boolean indicating if the error was from an api request cancellation
   */
  isCancel(error: any): boolean {
    return axios.isCancel(error);
  }

  /**
   * Retrieves a new and unique cancel token which can be
   * provided in an axios request to be cancelled later.
   */
  private static getCancellableToken(): CancelTokenSource {
    return axios.CancelToken.source();
  }

  /**
   * Updates the weakmap with a response promise and its
   * cancel token such that the cancel token can be easily
   * retrieved (and used for cancelling the request)
   */
  private updateRequestToBeCancellable(promise: Promise<any>, cancelTokenSource: CancelTokenSource) {
    this._cancelTokenMap.set(promise, cancelTokenSource);
  }

  private _request(params: AxiosRequestConfig, isAllResponse = false) {
    return axios(params)
      .then(response => (isAllResponse ? response : response.data))
      .catch(error => {
        throw error;
      });
  }
}

export enum HttpMethod {
  GET = "GET",
  POST = "POST"
}

class CognitoCredentials {
  //public credentials: ICredentials;
  public cognitoUser: CognitoUser;

  constructor(credentials: ICredentials, cognitoUser: CognitoUser) {
    //this.credentials = credentials;
    this.cognitoUser = cognitoUser;
  }

  get session() {
    return this.cognitoUser.getSignInUserSession();
  }
}

export class AuthenticatedRestClient extends RestClient {
  private Credentials = Credentials;
  private lastCognitoCredentials: CognitoCredentials | null = null;
  private previouslyFailedRequest: WeakMap<CancelToken, any> = new WeakMap<CancelToken, any>();

  readonly logger = new Logger("util.auth.AuthenticatedRestClient");

  constructor(options: RestClientOptions) {
    super(options);
    axios.interceptors.response.use(
      response => {
        return response;
      },
      error => {
        let failedRequest = error.config;
        this.logger.debug("request error", error?.response?.status);
        if (failedRequest && this.previouslyFailedRequest.has(failedRequest.cancelToken)) {
          this.previouslyFailedRequest.delete(failedRequest.cancelToken);
          return Promise.reject(error);
        }

        if (error?.response) {
          if (error.response.status == 401) {
            this.logger.warn(
              `Authentication failed for URL request. Status: ${error.response.status} Status text: ${error.response.status}} URL: ${error.response.responseURL}`
            );
            return this.getCredentials(true)
              .then(value => {
                this.previouslyFailedRequest.set(failedRequest.cancelToken, true);
                this.appendAuthorizationHeader(failedRequest.headers, value);
                return axios.request(failedRequest);
              })
              .catch(error => {
                this.logger.error("Error in obtaining credentials. Reason: ", error);
                //Todo: Take action here. We need to move to the login screen.
                return Promise.reject(error);
              });
          } else if (error.response.status == 500) {
            this.logger.error(
              `Internal server error. Status: ${error.response.status} Status text: ${error.response.statusText}} URL: ${error.response.responseURL}`
            );
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private static getTenantIdFromHeader(cognitoCredentials: CognitoCredentials) {
    return cognitoCredentials.session?.getIdToken()?.payload[getTenantIdAttributeName()];
  }

  private static createBearerToken(cognitoCredentials: CognitoCredentials) {
    return `Bearer ${cognitoCredentials.session?.getIdToken()?.getJwtToken()}`;
  }

  // noinspection JSMethodCanBeStatic
  private appendTenantIdHeader(authHeaders: { [p: string]: any }, cognitoCredentials: CognitoCredentials) {
    const tenantIdFromHeader = AuthenticatedRestClient.getTenantIdFromHeader(cognitoCredentials);
    if (!!tenantIdFromHeader) authHeaders[X_TENANT_ID_HEADER_NAME] = tenantIdFromHeader;
  }

  // noinspection JSMethodCanBeStatic
  private appendAuthorizationHeader(authHeaders: { [p: string]: any }, cognitoCredentials: CognitoCredentials) {
    const bearerToken = AuthenticatedRestClient.createBearerToken(cognitoCredentials);
    if (!!bearerToken) authHeaders["Authorization"] = bearerToken;
  }

  async ajax(urlOrApiInfo: string | ApiInfo, method: HttpMethod, init: InitOptions = {}): Promise<AxiosResponse> {
    const authHeaders: { [p: string]: any } = {};
    let headers = init.headers;

    let isTenantIdHeaderNotPresent = !headers || typeof headers[X_TENANT_ID_HEADER_NAME] === "undefined";
    let isAuthorizationHeaderNotPresent = !headers || typeof headers["Authorization"] === "undefined";
    if (isAuthorizationHeaderNotPresent || isTenantIdHeaderNotPresent) {
      try {
        let cognitoCredentials = await this.getCredentials();
        if (isAuthorizationHeaderNotPresent) this.appendAuthorizationHeader(authHeaders, cognitoCredentials);
        if (isTenantIdHeaderNotPresent) this.appendTenantIdHeader(authHeaders, cognitoCredentials);
        init.headers = {
          ...headers,
          ...authHeaders
        };
        this.logger.debug("Modified headers:", init.headers, headers);
      } catch (error) {
        console.error("Error in obtaining credentials.");
        await Router.push(LOGIN_PAGE, LOGIN_PAGE, { shallow: false });
        throw error;
      }
    }

    return super.ajax(urlOrApiInfo, method, init);
  }

  private async getCredentials(bypassCache: boolean = false): Promise<CognitoCredentials> {
    this.logger.debug("Trying to get existing credentials from amplify.");
    try {
      const credentials: ICredentials = await this.Credentials.get();
      let cognitoUser: CognitoUser = await Auth.currentAuthenticatedUser({ bypassCache: bypassCache });
      this.lastCognitoCredentials = new CognitoCredentials(credentials, cognitoUser);
      return this.lastCognitoCredentials;
    } catch (error) {
      console.warn("Error obtaining exiting credentials.", error);
      throw error;
    }
  }
}

export interface HttpResponseListener {
  onResponse(): void;

  onError(): void;
}

export type HttpResultType = {
  data: JSON_TYPE;
  status: number;
};

export type HttpErrorType = { problem: ProblemJson };

export class HttpResponse {
  private readonly promise: Promise<AxiosResponse>;

  constructor(promise: Promise<AxiosResponse>) {
    this.promise = promise;
    this.promise
      .then((response: AxiosResponse) => {
        this.onResult({ status: response.status, data: response?.data });
      })
      .catch(this.onException);
  }

  private _onResponse?: (data: HttpResultType) => void;
  private _onError?: (error: ProblemJson) => void;

  public cancel(reasonForCancel?: string): void {
    HTTP.cancel(this.promise, reasonForCancel);
  }

  public onResponse(onResponse: (data: HttpResultType) => void): HttpResponse {
    this._onResponse = onResponse;
    return this;
  }

  public onError(onError: (error: ProblemJson) => void): HttpResponse {
    this._onError = onError;
    return this;
  }

  public async get(): Promise<HttpResultType> {
    let axiosResponse = await this.promise;
    return { data: axiosResponse.data, status: axiosResponse.status };
  }

  public async getTyped<Type>(deserializer: HttpResponseDeserializer<Type>): Promise<Optional<Type>> {
    const newVar: HttpResultType = await this.get();
    return deserializer.deserialize(newVar);
  }

  private onResult = (data: HttpResultType) => {
    if (this._onResponse) {
      this._onResponse(data);
    }
  };

  private onException = (error: Error) => {
    if (this._onError) {
      if (error instanceof ProblemJsonException) {
        let problemJson: ProblemJson = (<ProblemJsonException>error).problemJson;
        this._onError(problemJson);
      } else {
        this._onError(new ProblemJson(error.message, 500, error.name, "Unknown Error", {}));
      }
    }
  };
}

export class PicoHttpRequests {
  private restClient: AuthenticatedRestClient = new AuthenticatedRestClient({});
  private logger: Logger = new Logger("util.auth.PicoHttpRequests");

  constructor() {}

  public cancel(promise: Promise<any>, reasonForCancel?: string): void {
    this.restClient.cancel(promise, reasonForCancel);
  }

  private readonly PROBLEM_JSON = "application/problem+json";

  post(url: string | ApiInfo, init?: InitOptions): HttpResponse {
    return this.ajax(url, HttpMethod.POST, init);
  }

  private getHeaderValue(headers: { [p: string]: any }, headerName: string): string | null {
    let value = null;
    if (headers.hasOwnProperty(headerName)) {
      value = headers[headerName];
    } else if (headers.hasOwnProperty(headerName.toUpperCase())) {
      value = headers[headerName.toUpperCase()];
    }
    this.logger.debug(`Found content-type header for ${headerName} -> ${value}`);
    return value;
  }

  private ajax(url: string | ApiInfo, method: HttpMethod, init?: InitOptions): HttpResponse {
    let promise: Promise<AxiosResponse> = this.restClient
      .ajax(url, method, init)
      .then(response => {
        const headers: JSON_TYPE = response?.headers;
        if (headers) {
          const headerValue = this.getHeaderValue(headers, "content-type");
          if (headerValue) {
            if (headerValue.startsWith(this.PROBLEM_JSON)) {
              const toProblemJson = ProblemJson.toProblemJson(response?.data);
              this.logger.debug(`Problem JSON object: ${JSON.stringify(toProblemJson)}`);
              throw new ProblemJsonException(toProblemJson);
            }
          }
        }
        return response;
      })
      .catch(error => {
        this.logger.debug(`Error: ${error}`);
        const headers: JSON_TYPE = error?.response.headers;
        if (headers) {
          const headerValue = this.getHeaderValue(headers, "content-type");
          if (headerValue) {
            if (headerValue.startsWith(this.PROBLEM_JSON)) {
              const toProblemJson = ProblemJson.toProblemJson(error?.response.data);
              this.logger.debug(`Problem JSON object: ${JSON.stringify(toProblemJson)}`);
              throw new ProblemJsonException(toProblemJson);
            }
          }
        }
        throw error;
      });
    return new HttpResponse(promise);
  }

  get(url: string | ApiInfo, init: InitOptions): HttpResponse {
    return this.ajax(url, HttpMethod.GET, init);
  }
}

export const HTTP = new PicoHttpRequests();

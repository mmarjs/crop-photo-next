import React, { ReactEventHandler, useState } from "react";
import { HTTP_GET, HTTP_POST, POST } from "../../util/auth/Authenticator";
import { useAuth } from "../../hooks/useAuth";
import { HTTP, HttpResultType } from "../../util/web/http-client";
import { ProblemJson } from "../../util/web/problem-json";
import Api from "../../util/web/api";
import Optional from "../../util/Optional";
import SmartCroppedAssetsResultsResponse from "../../models/SmartCroppedAssetsResultsResponse";

const API_METHOD_KEY = "test_api_method";

function getItemFromLC(key: string) {
  if (typeof window !== "undefined") {
    if (window && window.localStorage) {
      return window.localStorage?.getItem(key);
    }
  }

  return "";
}

function setItemFromLC(key: string, value: string) {
  if (typeof window !== "undefined") {
    if (window && window.localStorage) {
      return window.localStorage?.setItem(key, value);
    }
  }

  return "";
}

function getMethod() {
  return getItemFromLC(API_METHOD_KEY);
}

const API_PARAMS_KEY = "test_api_parameters";

function getTestAPIParams() {
  return getItemFromLC(API_PARAMS_KEY);
}

const TEST_API_URL = "test_api_url";

function getTestAPIURL() {
  return getItemFromLC(TEST_API_URL);
}

export default function ApiTest() {
  const [name] = useState<string | null>("Loading...");
  const [apiEndPoint, setAPIEndPoint] = useState<any>(getTestAPIURL() ? getTestAPIURL() : "/api/secured/roles-allowed");
  const [parameters, setParameters] = useState<any>(getTestAPIParams() ? getTestAPIParams() : "");
  const [method, setMethod] = useState<any>(getMethod() ? getMethod() : "GET");
  const [error, setError] = useState("");
  const [apiResponse, setAPIResponse] = useState<any>("");
  /**
   *
   * @param params
   */
  const callGet = (params: Object) => {
    console.info("Sending test get call: ", apiEndPoint, params);
    const httpResponse = HTTP.get(apiEndPoint, {
      queryStringParameters: params
    });
    httpResponse
      .onResponse((data: { [p: string]: any }) => {
        console.log("HTTP Response", data);
        setAPIResponse(JSON.stringify(data));
      })
      .onError((problem: ProblemJson) => {
        setAPIResponse(problem.detail);
        console.log("HTTP Error", JSON.stringify(problem));
        httpResponse.cancel("Bla bla");
      });
  };

  /**
   *
   * @param params
   */
  const callPost = (params: Object) => {
    HTTP.post(apiEndPoint, { body: params })
      .onResponse(r => {
        console.log("*******************text============>" + `${r.status} ${JSON.stringify(r.data)}`);
        const response: string = `${r.status}\n${JSON.stringify(r.data)}\n`;
        setAPIResponse(response);
      })
      .onError(error => {});
  };

  const apiCall = () => {
    const select = document.getElementById("method");
    // @ts-ignore
    let selectedIndex = select["selectedIndex"];
    // @ts-ignore
    const method: string = select?.options[selectedIndex].text;
    // @ts-ignore
    const reqData: string = document.getElementById("reqData").value;
    const params: Object = reqData ? JSON.parse(reqData) : null;
    if (method === HTTP_GET) {
      callGet(params);
    }
    if (method === HTTP_POST) {
      callPost(params);
    }
  };

  function onApiEndPointChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setAPIEndPoint(e.currentTarget.value);
    setItemFromLC(TEST_API_URL, e.currentTarget.value);
  }

  function onMethodChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setItemFromLC(API_METHOD_KEY, e.currentTarget.value);
    setMethod(e.currentTarget.value);
  }

  function onParametersChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setParameters(e.currentTarget.value);
    setItemFromLC(API_PARAMS_KEY, e.currentTarget.value);
  }

  return (
    <div style={{ textAlign: "center" }}>
      <main>
        <br />
        <br />
        <select name="method" id="method" onChange={onMethodChange} value={method}>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
        </select>
        <br />
        <label>URL:</label>
        <br />
        <textarea value={apiEndPoint} onChange={e => onApiEndPointChange(e)} cols={100} rows={5} />
        <br />
        <label>Parameters:</label>
        <br />
        <textarea
          placeholder="Enter Request data(optional)"
          id="reqData"
          rows={10}
          cols={100}
          onChange={onParametersChange}
          value={parameters}
        />
        <br />
        <label>Response:</label>
        <br />
        <textarea
          placeholder="Response will be displayed here"
          value={apiResponse}
          rows={10}
          cols={100}
          readOnly={true}
        />
        <br />
        <input type={"button"} onClick={apiCall} value={"API Call"} />
      </main>
    </div>
  );
}

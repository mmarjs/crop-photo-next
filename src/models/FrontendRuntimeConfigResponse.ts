import HttpResponseDeserializer from "../util/web/http-response-deserializer";
import { HttpResultType } from "../util/web/http-client";
import Optional from "../util/Optional";
import { JSON_TYPE, OBJECT_TYPE } from "../common/Types";

export default class FrontendRuntimeConfigResponse {
  public cognitoIdentityPoolId: string = "";
  public awsRegion: string = "";
  public cognitoUserPoolId: string = "";
  public cognitoDefaultUserPoolClientId: string = "";
  public cognitoUserPoolOAuthDomainURL: string = "";
  public cookieDomain: string = "";
  public assetStorageBucketName: string = "";

  public static serialize(resp: FrontendRuntimeConfigResponse): string {
    const json: JSON_TYPE = {};
    json["cognito_identity_pool_id"] = resp.cognitoIdentityPoolId;
    json["aws_region"] = resp.awsRegion;
    json["cognito_user_pool_id"] = resp.cognitoUserPoolId;
    json["cognito_default_user_pool_client_id"] = resp.cognitoDefaultUserPoolClientId;
    json["cognito_user_pool_oauth_domain_url"] = resp.cognitoUserPoolOAuthDomainURL;
    json["cookie_domain"] = resp.cookieDomain;
    json["asset_storage_bucket_name"] = resp.assetStorageBucketName;
    return JSON.stringify(json);
  }

  static deserializer(): HttpResponseDeserializer<FrontendRuntimeConfigResponse> {
    return new (class implements HttpResponseDeserializer<FrontendRuntimeConfigResponse> {
      deserialize(data: HttpResultType): Optional<FrontendRuntimeConfigResponse> {
        if (data) {
          let data1 = data.data;
          let resp = FrontendRuntimeConfigResponse.deserializeObject(data1);
          return Optional.of(resp);
        }
        return Optional.empty();
      }
    })();
  }

  public static deserializeObject(data: { [p: string]: any }) {
    let resp = new FrontendRuntimeConfigResponse();
    resp.cognitoIdentityPoolId = data["cognito_identity_pool_id"];
    resp.awsRegion = data["aws_region"];
    resp.cognitoUserPoolId = data["cognito_user_pool_id"];
    resp.cognitoDefaultUserPoolClientId = data["cognito_default_user_pool_client_id"];
    resp.cognitoUserPoolOAuthDomainURL = data["cognito_user_pool_oauth_domain_url"];
    resp.cookieDomain = data["cookie_domain"];
    resp.assetStorageBucketName = data["asset_storage_bucket_name"];
    return resp;
  }
}

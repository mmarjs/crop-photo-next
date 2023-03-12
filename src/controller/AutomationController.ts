import { GenericResponse } from "../models/GenericResponse";

/**
 *
 */
export default class AutomationController {
  static GET_ASSET_DETAILS_API: string = "/api/v1/user/get-asset-details";
  static GET_ASSET_AI_FEATURES_LIST_API: string = "/api/v1/user/get-asset-ai-features-list";
  static GET_ASSET_FEATURE_DETAILS_API: string = "/api/v1/user/get-asset-ai-feature-details";

  /**
   *
   * @param assetId
   * @returns
   */
  static async fetchAssetDetails(assetId: string): Promise<GenericResponse> {
    return Promise.resolve(new GenericResponse());
  }

  /**
   *
   */
  static async fetchAssetAIFeaturesList(assetId: string): Promise<GenericResponse> {
    return Promise.resolve(new GenericResponse());
    /*const { cognitoUserSession } = useAuth();
    return await GET(
      AutomationController.GET_ASSET_AI_FEATURES_LIST_API,
      cognitoUserSession,
      assetId
    )
      .then(async (response) => {
        return new GenericResponse(true, await response.json());
      })
      .catch((error: any) => {
        throw error;
      });*/
  }

  /**
   *
   * @param assetId
   * @returns
   */
  static async fetchAssetAIFeatureDetails(assetId: string): Promise<GenericResponse> {
    return Promise.resolve(new GenericResponse());
    /*const { cognitoUserSession } = useAuth();
    return await GET(
      AutomationController.GET_ASSET_FEATURE_DETAILS_API,
      cognitoUserSession,
      assetId
    )
      .then(async (response) => {
        return new GenericResponse(true, await response.json());
      })
      .catch((error: any) => {
        throw error;
      });*/
  }
}

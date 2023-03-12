import { useMutation } from "@tanstack/react-query";
import { OBJECT_TYPE } from "../../../../common/Types";
import API from "../../../../util/web/api";

export function useStartRemoveBgResizeAutomation(options: OBJECT_TYPE) {
  return useMutation(API.startRemoveBgResizeCropAutomation, options);
}

export function usePostRemoveBgResizeConfig(options: OBJECT_TYPE) {
  return useMutation(API.createRemoveBgResize, options);
}

export function useUpdateRemoveBgResizeConfig(options: OBJECT_TYPE) {
  return useMutation(API.editRemoveBgResize, options);
}

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useUpdateLatestJobId } from "..";
import { OBJECT_TYPE } from "../../../../common/Types";
import JobStartResponse from "../../../../models/JobStartResponse";
import Optional from "../../../../util/Optional";
import API from "../../../../util/web/api";
import { useGetandSetFaceCropName } from "./atomStore";

export function usePostCreateCustomFaceCropConfig(options?: OBJECT_TYPE) {
  return useMutation(API.createCustomFaceCrop, options);
}

export function useUpdateCustomFaceCropConfig(options?: OBJECT_TYPE) {
  return useMutation(API.editCustomFaceCropConfig, options);
}

export function useStartCustomFacepAutomation() {
  return useMutation(API.startUnrecognizableCropAutomation);
}

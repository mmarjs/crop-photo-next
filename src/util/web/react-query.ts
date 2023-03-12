import { QueryClient, useMutation } from "@tanstack/react-query";
import { OBJECT_TYPE } from "../../common/Types";
import API from "./api";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
    }
  }
});

export function useCreateJob(options: OBJECT_TYPE) {
  return useMutation(API.createQCJob, options);
}

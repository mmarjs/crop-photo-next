import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useRef } from "react";
import { QCJobStatus } from "../../../common/Types";
import Heading from "../../../ui-components/loading-report/heading";
import LoadingCards from "../../../ui-components/loading-report/loading-cards";
import NavigationHeader from "../../../ui-components/main-report/Header/NavigationHeader";
import API from "../../../util/web/api";
import styles from "./loading-report.module.scss";

const LoadingReport = () => {
  const router = useRouter();
  let { jobId } = router?.query;
  const jobStatusRef = useRef(QCJobStatus.IN_PROGRESS);

  useQuery(["qcJobStatus", jobId], () => API.getQCJobStatus(jobId as string), {
    enabled: !!jobId && jobStatusRef?.current === QCJobStatus.IN_PROGRESS,
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
    onSuccess: data => {
      const status = data?.data?.status;
      if (status === "ERROR") {
        const error = JSON.parse(data?.data?.error);
        router?.push(`/listing-analyzer/report/?jobId=${jobId}&errorCode=${error.error_code}`);
      }
      if (!!data?.data) {
        jobStatusRef.current = data?.data?.status;
      }
    },
    onError: (error: any) => {
      if (error?.response?.status === 500) {
        router?.push(`/listing-analyzer/report/?jobId=${jobId}&errorCode=INTERNAL_SERVER_ERROR`);
      }
    }
  });

  return (
    <div className={styles.wrapper}>
      <NavigationHeader />
      <div className={styles.headingWrapper}>
        <Heading />
      </div>
      <LoadingCards status={jobStatusRef.current} jobId={jobId as string} />
    </div>
  );
};

export default LoadingReport;

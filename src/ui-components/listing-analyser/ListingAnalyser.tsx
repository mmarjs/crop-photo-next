import { useMutation, useQuery } from "@tanstack/react-query";
import { isEmpty } from "lodash";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { platforms, QCJobDetails, QCJobStatus } from "../../common/Types";
import { useCreateJob } from "../../util/web/react-query";
import { InputWithButton } from "../components/input/input";

import styles from "./ListingAnalyser.module.scss";

export const getPlatformId = (url: string) => {
  const trimmedWords = url.match(/amazon/g);
  if (!trimmedWords) return undefined;
  return platforms.get(trimmedWords[0]);
};

export default function ListingAnalyser() {
  const { t } = useTranslation();
  const router = useRouter();
  const jobStatusRef = useRef<string>("");
  const [listingURL, setListingURL] = useState("");
  const { mutate, isLoading } = useCreateJob({
    onSuccess: (data: any) => {
      if (!!data?.data) {
        jobStatusRef.current = QCJobStatus.IN_PROGRESS;
        router.push(`/listing-analyzer/in-progress?jobId=${data?.data?.job_id}`);
      }
    },
    onError: (error: any) => {
      console.log("error", error);
    }
  });

  const handleCreateJob = () => {
    if (!listingURL) return;
    const platformId = getPlatformId(listingURL);
    const jobDetail: QCJobDetails = {
      target_type: "URL",
      target_value: listingURL,
      platform_id: platformId
    };
    mutate(jobDetail);
  };
  const handleListingURLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setListingURL(e.target.value);
  };

  return (
    <div className={styles.ListingAnalyser}>
      <div className={styles.hero}>
        <div>
          <h1 className={styles.listingAnalyserTitle}>
            <p>
              <span>{t("analyser.title.get")}</span>
              <span className={styles.styledText}>{t("analyser.title.insights")}</span>
            </p>
            <span>{t("analyser.title.cont")}</span>
          </h1>
          <p className={styles.titleDescription}>{t("analyser.description")}</p>
        </div>
        <div className={styles.listingAnalyserInput}>
          <h2 className={styles.listingAnalyserInputTitle}>
            <span className={styles.boldText}>{t("analyser.try_now")}</span>
            <span>{t("analyser.its_free")}</span>
          </h2>
          <p className={styles.listingAnalyserInputDescription}>
            <span>{t("analyser.paste")}</span>
            <a href="#" className={styles.linkText}>
              {t("analyser.upload_text")}
            </a>
          </p>
          <InputWithButton
            buttonProps={{
              label: t("analyser.button_label"),
              disabled: isEmpty(listingURL),
              onClick: handleCreateJob,
              loading: isLoading
            }}
            inputProps={{
              placeholder: t("analyser.placeholder"),
              onChange: handleListingURLChange,
              value: listingURL
            }}
          />
        </div>
      </div>
      <div className={styles.staticImage}></div>
    </div>
  );
}

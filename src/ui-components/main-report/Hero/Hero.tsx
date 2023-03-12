import { useRouter } from "next/router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { QCJobDetails } from "../../../common/Types";
import { useCreateJob } from "../../../util/web/react-query";
import { InputWithButton } from "../../components/input/input";
import { getPlatformId } from "../../listing-analyser/ListingAnalyser";
import styles from "./Hero.module.scss";

enum ErrorTypes {
  INVALID_LISTING_URL = "INVALID_LISTING_URL",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  RAINFOREST_API_ERROR = "RAINFOREST_API_ERROR"
}

function getErrorType(type: string) {
  switch (type) {
    case ErrorTypes.INVALID_LISTING_URL:
      return "Invalid Listing URL";
    case ErrorTypes.RAINFOREST_API_ERROR:
      return "RainForest API Error";
    case ErrorTypes.INTERNAL_SERVER_ERROR:
    default:
      return "Internal Server Error";
  }
}

function insertWWW(url: string) {
  return url.substr(0, 8) + "www." + url.substr(8);
}

const amazonRegexWithOptions =
  /(https:\/\/)?(?=(?:....)?amazon)(www.)?[A-Za-z]{2,6}(((?:\/(?:dp|gp)\/([A-Z0-9]+))?\S*[?&]?(?:tag=))?\S*?)(?:#)?(\w*?-\w{2})?(\S*)(#?\S*)+/;

const amazonStrictRegex =
  /(https:\/\/)(www.amazon.)[A-Za-z]{2,6}(((?:\/(?:dp|gp)\/([A-Z0-9]+))?\S*[?&]?(?:tag=))?\S*?)(?:#)?(\w*?-\w{2})?(\S*)(#?\S*)+/;

export default function Hero() {
  const { t } = useTranslation();
  const [listingURL, setListingURL] = useState("");
  const [isValidAmazonURL, setIsValidAmazonURL] = useState(false);
  const router = useRouter();
  const { errorCode } = router?.query;

  const { mutate, isLoading: isCreatingJob } = useCreateJob({
    onSuccess: (data: any) => {
      if (!!data?.data) {
        setListingURL("");
        window.open(`/listing-analyzer/in-progress?jobId=${data?.data?.job_id}`);
      }
    },
    onError: (error: any) => {
      console.log("error", error);
    }
  });

  const handleCreateJob = () => {
    if (!listingURL) return;
    const platformId = getPlatformId(listingURL);

    //TODO: convert it to regex checking later
    let cleanURL = listingURL;
    const isComplete = cleanURL.indexOf("https://www") === 0;
    const hasHTTP = cleanURL.indexOf("https://") === 0;
    const hasWWW = cleanURL.indexOf("www") === 0;

    if (!isComplete) {
      if (!!cleanURL && !hasWWW && !hasHTTP) {
        cleanURL = `https://www.${cleanURL}`;
      }
      if (!!cleanURL && !hasWWW && hasHTTP) {
        const withWWW = insertWWW(cleanURL);
        cleanURL = withWWW;
      }
      if (!!cleanURL && !hasHTTP && hasWWW) {
        cleanURL = `https://${cleanURL}`;
      }
    }

    const isFinalValid = amazonStrictRegex.test(cleanURL);
    if (!isFinalValid) {
      setIsValidAmazonURL(false);
      return;
    }

    const jobDetail: QCJobDetails = {
      target_type: "URL",
      target_value: cleanURL,
      platform_id: platformId
    };
    mutate(jobDetail);
  };

  const handleListingURLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    setIsValidAmazonURL(amazonRegexWithOptions.test(value));
    setListingURL(value);
  };

  return (
    <div className={styles.Hero}>
      {errorCode ? <img src="/images/generic-error.svg" alt="generic error" width={126} /> : null}
      <h1 className={styles.heroTitle}>
        {errorCode ? (
          <span className={styles.errorText}>{getErrorType(errorCode as string)}</span>
        ) : (
          <>
            <span>{t("main_report.hero.title")} </span>
            <span className={styles.gradientText}>{t("main_report.hero.gradientText")}</span>
          </>
        )}
      </h1>
      <p className={styles.heroDesc}>{!!errorCode ? t(`main_report.hero.${errorCode}`) : t("main_report.hero.desc")}</p>
      <InputWithButton
        buttonProps={{
          label: t("main_report.hero.new_report"),
          disabled: !listingURL || !isValidAmazonURL,
          onClick: handleCreateJob,
          loading: isCreatingJob
        }}
        inputProps={{
          placeholder: t("main_report.hero.placeholder"),
          value: listingURL,
          onChange: handleListingURLChange,
          title: listingURL,
          onPressEnter: handleCreateJob
        }}
        errorMessage={!isValidAmazonURL ? t("main_report.hero.invalid_url") : undefined}
      />
    </div>
  );
}

import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { SETTINGS_PAGE } from "../../../../lib/navigation/routes";
import { Breadcrumbs } from "../../../../ui-components/components/breadcrumb";
import { LeftPanel } from "../../../../ui-components/components/left-panel";
import styles from "../../../../styles/Stats.module.scss";
import StatsCard from "./StatsCard";
import {
  StatsAutomations,
  StatsDownloads,
  StatsUploads,
  StatsTotalCrop,
  UnrecognizableCropIcon,
  SmartCropIcon,
  RemoveBgIcon
} from "../../../../ui-components/assets";
import API from "../../../../util/web/api";
import { useQuery } from "@tanstack/react-query";
import { DatePicker } from "antd";
import type { Dayjs } from "dayjs";
import date from "../../../../ui-components/utils/date";
import { abbreviateNumber } from "../../../../ui-components/utils";

const { RangePicker } = DatePicker;

type RangeValue = [Dayjs | null, Dayjs | null] | null;

const Stats = () => {
  const { t } = useTranslation();

  const [dates, setDates] = useState<RangeValue>(null);
  const [value, setValue] = useState<RangeValue>([date().subtract(1, "M"), date()]);

  let breadcrumbPathArray = [[t("settings.title"), SETTINGS_PAGE], [t("settings.all_stats")]];

  const disabledDate = useCallback(
    (current: Dayjs) => {
      if (!dates) {
        return false;
      }
      const tooLate = dates[0] && current.diff(dates[0], "months") > 6;
      const tooEarly = dates[1] && dates[1].diff(current, "months") > 6;
      const futureDate = current && current > date();
      const pastDate = current && current.isBefore(date().subtract(6, "months"));
      return !!tooEarly || !!tooLate || futureDate || pastDate;
    },
    [dates]
  );

  const onOpenChange = useCallback((open: boolean) => {
    if (open) {
      setDates([null, null]);
    } else {
      setDates(null);
    }
  }, []);

  let start_date: string | undefined;
  if (value && value[0]) {
    start_date = value[0].clone().startOf("day").utc().toISOString();
  } else {
    start_date = date().utc().startOf("day").toISOString();
  }
  let end_date: string | undefined;
  if (value && value[1]) {
    end_date = value[1].clone().endOf("day").utc().toISOString();
  } else {
    end_date = date().utc().endOf("day").toISOString();
  }

  const {
    data: statsResult,
    isLoading,
    refetch: refetchStats
  } = useQuery(["statsResult", value], () => API.getStats(start_date!, end_date!), {
    // enabled: !!value
  });

  // useEffect(() => {
  //   API.getStats(start_date, end_date).then(data => {
  //     console.log("stats response", data)
  //   })
  //     .catch(err => {
  //       console.error("Error in loading stats", err);
  //     });

  // }, [])

  // console.log("stats response", statsResult, isLoading);

  const automationTotal = statsResult?.data?.total_automation_created;
  const unrecTotal = statsResult?.data?.total_uc_jobs;
  const smartCropTotal = statsResult?.data?.total_sc_jobs;
  const removeBgTotal = statsResult?.data?.total_rm_bg_jobs;
  const uploadTotal = statsResult?.data?.num_of_inputs;
  const cropTotal = statsResult?.data?.num_of_crops;
  const downloadTotal = statsResult?.data?.download_count;
  const backgroundsRemovedTotal = statsResult?.data?.num_of_rm_bg;
  const automationCounts = useCallback(() => {
    return [
      {
        id: 1,
        icon: <StatsAutomations />,
        title: t("stats.automations"),
        value: automationTotal
      },
      {
        id: 2,
        icon: <RemoveBgIcon fill="#0038FF" />,
        title: t("home.remove_bg_resize"),
        value: removeBgTotal
      },
      {
        id: 3,
        icon: <UnrecognizableCropIcon />,
        title: t("home.unrecognizable_crop"),
        value: unrecTotal
      },
      {
        id: 4,
        icon: <SmartCropIcon />,
        title: t("home.smart_crop"),
        value: smartCropTotal
      }
    ];
  }, [automationTotal, unrecTotal, removeBgTotal, smartCropTotal]);

  const totalCounts = useCallback(() => {
    return [
      {
        id: 5,
        icon: <StatsUploads />,
        title: t("stats.uploads"),
        value: uploadTotal
      },
      {
        id: 6,
        icon: <StatsTotalCrop />,
        title: t("stats.total_crops"),
        value: cropTotal
      },
      {
        id: 7,
        icon: <StatsDownloads />,
        title: t("stats.downloads"),
        value: downloadTotal
      },
      {
        id: 8,
        icon: <RemoveBgIcon fill="#0038FF" />,
        title: t("stats.background_removed"),
        value: backgroundsRemovedTotal
      }
    ];
  }, [uploadTotal, downloadTotal, cropTotal]);

  useEffect(() => {
    if (dates !== null) refetchStats();
  }, [value]);

  return (
    <div style={{ height: "100vh", display: "flex" }}>
      <LeftPanel selectedPage="Settings" />

      <div style={{ background: "#FAFAFB", height: "100%", width: "100%", overflow: "scroll" }}>
        <div className={styles.Header}>
          <Breadcrumbs pathArray={breadcrumbPathArray} />
        </div>
        <div className={styles.wrapper}>
          <div>
            <RangePicker
              ranges={{
                Today: [date(), date()],
                "Last 7 days": [date().subtract(1, "w"), date()],
                "Last 14 days": [date().subtract(2, "w"), date()],
                "Last 1 month": [date().subtract(1, "M"), date()],
                "Last 3 months": [date().subtract(3, "M"), date()]
              }}
              allowClear={false}
              defaultValue={[date().subtract(1, "M"), date()]}
              value={dates || value}
              disabledDate={disabledDate}
              onCalendarChange={val => setDates(val)}
              onChange={val => setValue(val)}
              onOpenChange={onOpenChange}
              // onBlur={() => console.log('blurred')}
              style={{ marginBottom: "1rem", height: "2.75rem", color: "#4D5C71", borderRadius: "5px" }}
            />
            <h1 className={styles.heading}>{t("stats.automation_stats")}</h1>
            <div className={styles.statsCardWrapper}>
              {automationCounts().map((count, i) => {
                return (
                  <>
                    <StatsCard
                      key={count.id}
                      icon={count.icon}
                      title={count.title}
                      value={abbreviateNumber(count.value)}
                      isLoading={isLoading}
                    />
                  </>
                );
              })}
            </div>
            <h1 className={styles.heading2}>{t("stats.overall_stats")}</h1>
            <div className={styles.statsCardWrapper}>
              {totalCounts().map((count, i) => {
                return (
                  <>
                    <StatsCard
                      key={count.id}
                      icon={count.icon}
                      title={count.title}
                      value={abbreviateNumber(count.value)}
                      isLoading={isLoading}
                    />
                  </>
                );
              })}
            </div>
          </div>
          <div className={styles.info}>{t("stats.data_visibility")}</div>
        </div>
      </div>
    </div>
  );
};

export default Stats;

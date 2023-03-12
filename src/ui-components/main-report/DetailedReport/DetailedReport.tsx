import classNames from "classnames";
import { useEffect, forwardRef, useMemo, useRef, useState, ReactNode, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Grid from "antd/lib/grid";
import Tooltip from "antd/lib/tooltip";
import { Variant } from "../OverviewCard/OverviewCard";
import Carousel from "react-multi-carousel";

import "react-multi-carousel/lib/styles.css";
import styles from "./DetailedReport.module.scss";
import FixItToolWaitlist from "../FixItToolWaitlist";
import { useRouter } from "next/router";

const { useBreakpoint } = Grid;

const responsiveCarousel = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 9
  },
  tablet: {
    breakpoint: { max: 1023, min: 768 },
    items: 6
  },
  mobile: {
    breakpoint: { max: 767, min: 1 },
    items: 3,
    partialVisibilityGutter: 10
  }
};

export default function DetailedReport({
  variants,
  onSelectReport,
  selectedId,
  onSelectNextReport,
  onSelectPreviousReport,
  hasNext,
  hasPrevious
}: {
  variants: Variant[];
  onSelectReport: (id: string) => void;
  selectedId: string | undefined;
  onSelectNextReport: () => void;
  onSelectPreviousReport: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const { expanded } = router?.query;
  const showJoinWaitlist = router?.query?.showJoinWaitlist;
  const carouselRef = useRef();
  const screens = useBreakpoint();
  const [expandReport, setExpandReport] = useState(false);

  useEffect(() => {
    onSelectReport(variants[0]?.id || "");
  }, [variants]);

  useEffect(() => {
    setExpandReport(!!expanded);
  }, [expanded]);

  useEffect(() => {
    if (selectedId && !!carouselRef?.current && screens.xs) {
      const slideIndex = variants.findIndex(v => v.id === selectedId);
      if (slideIndex !== -1) {
        //@ts-ignore
        carouselRef.current.goToSlide(slideIndex);
      }
    }
  }, [selectedId, carouselRef, screens]);

  const slideToImage = useCallback(
    (id: string) => {
      if (id && !!carouselRef?.current && screens.xs) {
        const slideIndex = variants.findIndex(v => v.id === id);
        if (slideIndex !== -1) {
          //@ts-ignore
          carouselRef.current.goToSlide(slideIndex);
        }
      }
    },
    [carouselRef, screens]
  );

  const collapsedText =
    screens.xs || (screens.sm && !screens.xl)
      ? t("main_report.detailed_report.collapsed.small")
      : t("main_report.detailed_report.collapsed.large");
  const collapseText =
    screens.xs || (screens.sm && !screens.xl)
      ? t("main_report.detailed_report.collapse.small")
      : t("main_report.detailed_report.collapse.large");
  const expandedText =
    screens.xs || (screens.sm && !screens.xl)
      ? t("main_report.detailed_report.expanded.small")
      : t("main_report.detailed_report.expanded.large");
  const expandText =
    screens.xs || (screens.sm && !screens.xl)
      ? t("main_report.detailed_report.expand.small")
      : t("main_report.detailed_report.expand.large");
  return (
    <div
      className={classNames(styles.DetailedReport, {
        [styles.showJoinWaitlist]: showJoinWaitlist
      })}
    >
      {showJoinWaitlist ? <FixItToolWaitlist /> : null}
      <div className={styles.detailedReportHeader}>
        <div className={styles.detailedReportHead}>
          <h2>
            <span>{t("main_report.detailed_report.title")}</span>
            <Tooltip title={t("main_report.detailed_report.tooltip")}>
              <img src="/images/tooltip-muted.svg" width={18} />
            </Tooltip>
          </h2>
          <p>
            <a href="#" className={styles.signup}>
              {t("main_report.score_by_image.sign_up")}
            </a>
            <span>{t("main_report.detailed_report.signup_cont")}</span>
          </p>
        </div>
        <div
          className={classNames(styles.accordionSwitch, {
            [styles.expanded]: expandReport
          })}
          onClick={() => {
            // setExpandReport(old => !old);
            const jobId = router?.query?.jobId;
            if (!expandReport) {
              router?.push(`${router?.pathname}?jobId=${jobId}&expanded=true`);
            } else {
              router?.push(`${router?.pathname}?jobId=${jobId}`);
            }
          }}
        >
          <span
            className={classNames(styles.switchButton, {
              [styles.highlightedButton]: !expandReport
            })}
          >
            {expandReport ? collapseText : collapsedText}
          </span>
          <span
            className={classNames(styles.switchButton, {
              [styles.highlightedButton]: expandReport
            })}
          >
            {expandReport ? expandedText : expandText}
          </span>
        </div>
      </div>
      <div className={styles.selectedImagesList}>
        {/* <div className={styles.selectedImagesListButtons}>
          
        </div> */}
        <div
          className={classNames(styles.sliderIcon, styles.sliderIconLeft, {
            [styles.sliderIconDisabled]: !hasPrevious
          })}
          onClick={onSelectPreviousReport}
        >
          <img src={"/images/chevron-left.svg"} />
        </div>
        <div
          className={classNames(styles.sliderIcon, styles.sliderIconRight, {
            [styles.sliderIconDisabled]: !hasNext
          })}
          onClick={onSelectNextReport}
        >
          <img src={"/images/chevron-right.svg"} />
        </div>
        <Carousel
          //@ts-ignore
          ref={carouselRef}
          responsive={responsiveCarousel}
          additionalTransfrom={0}
          centerMode={false}
          partialVisible={screens.xs}
          focusOnSelect={false}
          infinite={false}
          keyBoardControl={true}
          minimumTouchDrag={80}
          pauseOnHover={false}
          renderArrowsWhenDisabled={false}
          renderButtonGroupOutside={false}
          renderDotsOutside={false}
          rewindWithAnimation={false}
          rtl={false}
          showDots={false}
          itemClass={styles.carouselItem}
          containerClass={styles.scoredImagesList}
          rewind={false}
          swipeable
          draggable
          arrows={false}
        >
          {variants?.map((variant: Variant, index) => (
            <ReportVariant
              key={index}
              variant={variant}
              selectedId={selectedId as string}
              slideToImage={slideToImage}
              onSelectReport={onSelectReport}
            />
          ))}
        </Carousel>
      </div>
    </div>
  );
}

const ReportVariant = ({
  variant,
  selectedId,
  onSelectReport,
  slideToImage
}: {
  variant: Variant;
  selectedId: string;
  onSelectReport: (id: string) => void;
  slideToImage: (id: string) => void;
}) => {
  const imageRef = useRef();
  const isVisible = useRef(imageRef);
  const isVariantGlobalListing = variant.id === "listing";
  const isVariantSelected = selectedId === variant?.id;
  const screens = useBreakpoint();

  useEffect(() => {
    if (!isVisible) {
      slideToImage(variant?.id || "");
    }
  }, [isVisible]);

  if (isVariantGlobalListing) {
    return (
      <div
        key={variant.id}
        className={classNames(styles.globalVariant, {
          [styles.selectedVariant]: isVariantSelected,
          [styles.selectedVariantOverview]: isVariantSelected && (screens.xs || (screens.sm && !screens.xl))
        })}
        onClick={() => {
          onSelectReport(variant.id ?? "");
        }}
        //@ts-ignore
        ref={imageRef}
      >
        {screens.xs || (screens.sm && !screens.xl) ? (
          <p className={styles.globalVariantOverviewText}>Overview</p>
        ) : (
          <>
            <img src={"/images/amazon_round.svg"} width={24} height={24} className={styles.globalVariantImage} />
            <p className={styles.globalVariantText}>
              <span>{`Listing's`}</span>
              <span className={styles.globalIssuesText}>Global Issues</span>
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      key={variant.id}
      className={classNames(styles.listingVariant, {
        [styles.selectedVariant]: isVariantSelected
      })}
      onClick={() => {
        onSelectReport(variant.id ?? "");
      }}
      //@ts-ignore
      ref={imageRef}
    >
      {isVariantSelected && selectedId === "main" ? (
        <img src="/images/crown.svg" alt="#" height={24} width={24} className={styles.crownBadge} />
      ) : null}
      <img src={variant.imageUrl} />
    </div>
  );
};

interface CustomArrowProps {
  lastItem?: number;
  onClick: Function;
  onMove: Function;
  carouselState: {
    currentSlide: number;
    deviceType: string;
  };
  rest: any;
}

const CustomRightArrow = ({ onClick, ...rest }: CustomArrowProps) => {
  return (
    <div className={styles.sliderIcon} onClick={() => onClick()} {...rest}>
      <img src={"/images/chevron-right.svg"} />
    </div>
  );
};

const CustomLeftArrow = ({ onClick, ...rest }: CustomArrowProps) => {
  return (
    <div className={styles.sliderIcon} onClick={() => onClick()} {...rest}>
      <img src={"/images/chevron-left.svg"} />
    </div>
  );
};

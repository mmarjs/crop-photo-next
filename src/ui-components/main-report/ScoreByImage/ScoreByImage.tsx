import { useTranslation } from "react-i18next";
import { Button } from "../../components/button";
import { useEffect, useState } from "react";
import Grid from "antd/lib/grid";
import classNames from "classnames";
import Collapse from "antd/lib/collapse";
import Carousel from "react-multi-carousel";

import "react-multi-carousel/lib/styles.css";
import styles from "./ScoreByImage.module.scss";
import { Variant } from "../OverviewCard/OverviewCard";

const { useBreakpoint } = Grid;

const { Panel } = Collapse;

type ImageIssue = {
  id: string;
  label: string;
};

type ScorePanelDetails = {
  count: number;
  details: ImageIssue[];
};

export type ScorePanel = {
  critical_issues: ScorePanelDetails;
  image_id: string;
  recommended_changes: ScorePanelDetails;
  score_change: number;
  total_score: number;
};

interface ScoreByImageProps {
  variantImages: Variant[];
  data: ScorePanel[];
}

export default function ScoreByImage({ variantImages, data }: ScoreByImageProps) {
  const { t } = useTranslation();
  const [isMainSelected, setIsMainSelected] = useState(false);
  const [selectedScorePanel, setSelectedScorePanel] = useState<ScorePanel>();

  useEffect(() => {
    if (!!data) {
      setSelectedScorePanel(data[0]);
    }
  }, [data]);

  const handleSelectImage = (variant: any) => {
    if (variant?.id === "main" || variant?.image_id === "main") {
      setIsMainSelected(true);
    } else {
      setIsMainSelected(false);
    }
  };

  return (
    <div className={styles.ScoreByImage}>
      <div className={styles.scoreByImageHeader}>
        <div>
          <h2>
            <span>{t("main_report.score_by_image.title")}</span>
            <img src="/images/tooltip-muted.svg" width={18} />
          </h2>
          <p>
            <span className={styles.signup}>{t("main_report.score_by_image.sign_up")}</span>{" "}
            <span>{t("main_report.score_by_image.sign_up_cont")}</span>
          </p>
        </div>
        <Button
          icon={<img src="/images/lock.svg" alt="#" height={20} width={20} />}
          iconPosition="left"
          type="primary"
          label={t("main_report.explore_btn")}
          disabled
        />
      </div>
      <div className={styles.scoreByImageDetails}>
        <ImageSlider variants={variantImages} onSelectImage={handleSelectImage} />
        <ScoredByImageInfo showOverlay={!isMainSelected} data={selectedScorePanel} />
      </div>
    </div>
  );
}

const settings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 5,
  slidesToScroll: 1
};

const responsiveCarousel = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 4
  },
  tablet: {
    breakpoint: { max: 1023, min: 768 },
    items: 6
  },
  mobile: {
    breakpoint: { max: 767, min: 1 },
    items: 3
  }
};

const ImageSlider = ({ variants, onSelectImage }: { variants: Variant[]; onSelectImage: (id: Variant) => void }) => {
  const [selected, setSelected] = useState<Variant>(variants[0]);
  const screens = useBreakpoint();
  const { t } = useTranslation();

  useEffect(() => {
    setSelected(variants[0]);
    onSelectImage(variants[0]);
  }, [variants]);

  const isSelectedMainPhoto = selected?.id === "main";
  return (
    <div className={styles.scoredImagesContainer}>
      <Carousel
        responsive={responsiveCarousel}
        additionalTransfrom={0}
        autoPlaySpeed={3000}
        centerMode={false}
        focusOnSelect={false}
        infinite={false}
        keyBoardControl
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
        rewind
        removeArrowOnDeviceType={["tablet", "mobile"]}
        swipeable
        draggable
        //@ts-ignore
        customLeftArrow={<CustomRightArrow />}
        //@ts-ignore
        customRightArrow={<CustomRightArrow />}
      >
        {variants.map((variant: Variant) => (
          <div
            key={variant.id}
            className={classNames(styles.variantBorder, {
              [styles.selectedVariant]: variant?.id === selected?.id
            })}
            onClick={() => {
              setSelected(variant);
              onSelectImage(variant);
            }}
          >
            {variant?.id === "main" && variant?.id === selected?.id ? (
              <img src="/images/crown.svg" alt="#" height={20} width={20} className={styles.crownBadge} />
            ) : null}
            <img src={variant.imageUrl} className={styles.variantImage} />
          </div>
        ))}
      </Carousel>
      <div className={styles.selectedScoredImage}>
        <div
          className={styles.imageBadge}
          style={{
            background: isSelectedMainPhoto ? "#dfe7fc" : "#E2E8F0",
            color: isSelectedMainPhoto ? "#0038FF" : "#1E293B"
          }}
        >
          <img src={isSelectedMainPhoto ? "/images/crown.svg" : "/images/variant.svg"} alt="crown" />
          {isSelectedMainPhoto ? t("main_report.score_by_image.main_photo") : t("main_report.score_by_image.variant")}
        </div>
        <img src={selected?.imageUrl} alt="#" className={styles.selectedImage} />
      </div>
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
      <img src={"/images/slider-arrow.svg"} />
    </div>
  );
};

const ScoredByImageInfo = ({ showOverlay, data }: { showOverlay: boolean; data: ScorePanel | undefined }) => {
  const { t } = useTranslation();
  const handleCollapseChange = () => {};
  return (
    <div className={styles.scoredByImageInfoContainer}>
      <div className={styles.scoredByImageInfoHeader}>
        <h2 className={styles.infoHeaderTitle}>
          <span>{t("main_report.score_by_image.selected_image")} </span>
          <span>{t("main_report.score_by_image.total_score")}</span>
        </h2>
        <p className={styles.infoHeaderRate}>{data?.total_score || "0"}%</p>
      </div>
      <div className={styles.scoredByImageInfoSubHeader}>
        <p className={styles.infoSubHeader}>
          <img src="/images/increase_arrow.svg" alt="arrow" width={20} height={20} />
          <span className={styles.infoSubHeaderRate}>{data?.score_change || "0"}%</span>
          <span className={styles.infoSubHeaderText}>{t("main_report.score_card.after_crop")}</span>
        </p>
      </div>
      <div className={styles.accordionContainer} defaultValue="1">
        <Collapse
          defaultActiveKey={["1", "2"]}
          onChange={handleCollapseChange}
          expandIconPosition="right"
          expandIcon={() => <img src="/images/expand_arrow.svg" alt="expand" />}
        >
          <Panel
            className={styles.criticalPanel}
            header={
              <div className={styles.accordionTitle}>
                <img src="/images/critical.svg" />
                <span className={styles.accordionIssueTitle}>
                  {t("main_report.score_by_image.critical_issues_fixed")}
                </span>
                <span className={styles.accordionIssueCount}>{data?.critical_issues?.count}</span>
              </div>
            }
            key="1"
          >
            <div className={styles.innerPanelContainer}>
              {!!data && data?.critical_issues?.count > 0 ? (
                <>
                  {data.critical_issues.details.map((detail: ImageIssue) => (
                    <p className={styles.panelRow} key={detail.id}>
                      <img src="/images/read.svg" alt="read" />
                      <span>{detail.label}</span>
                    </p>
                  ))}
                </>
              ) : null}
            </div>
          </Panel>
          <Panel
            className={styles.criticalPanel}
            header={
              <div className={styles.accordionTitle}>
                <img src="/images/warning.svg" alt="warning" />
                <span className={styles.accordionIssueTitle}>
                  {t("main_report.score_by_image.recommended_changes_fixed")}
                </span>
                <span className={styles.accordionIssueCount}>{data?.recommended_changes?.count}</span>
              </div>
            }
            key="2"
          >
            <div className={styles.innerPanelContainer}>
              {!!data && data?.recommended_changes?.count > 0 ? (
                <>
                  {data.recommended_changes.details.map((detail: ImageIssue) => (
                    <p className={styles.panelRow} key={detail.id}>
                      <img src="/images/read.svg" alt="read" />
                      <span>{detail.label}</span>
                    </p>
                  ))}
                </>
              ) : null}
            </div>
          </Panel>
        </Collapse>
        <p className={styles.viewReport}>
          <img src="/images/arrow_down.svg" alt="arrow_down" />
          <span>{t("main_report.score_by_image.view_report")}</span>
        </p>
        {/* {showOverlay ? <ScoreByImageOverlay /> : null} */}
      </div>
    </div>
  );
};

const ScoreByImageOverlay = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.scoreByImageOverlay}>
      <div className={styles.scoreByImageOverlayContent}>
        <img src="/images/gradient-lock.svg" alt="gradient_lock" className={styles.scoreByImageOverlayGradientLock} />
        <div className={styles.scoreByImageOverlayTitle}>
          <h3 className={styles.scoreByImageOverlayHeading}>
            <span className={styles.headingText}>{t("main_report.score_by_image.join")} </span>
            <span className={styles.gradientText}>{t("main_report.score_by_image.crop_photo")}</span>
          </h3>
          <p>{t("main_report.score_by_image.join_description")}</p>
        </div>
        <div className={styles.scoreByImageOverlayActions}>
          <Button label={t("main_report.score_by_image.sign_in")} className={styles.overlaySignInButton} />
          <Button type="primary" label={t("main_report.score_by_image.register")} />
        </div>
      </div>
      <div className={styles.scoreByImageOverlayLockContent}>
        <p className={styles.scoreByImageOverlayLockText}>
          <img src="/images/grey-lock.svg" alt="lock" className={styles.scoreByImageOverlayGreyLock} />
          <span className={styles.scoreByImageOverlayLockMessage}>{t("main_report.score_by_image.lock_message")}</span>
        </p>
      </div>
    </div>
  );
};

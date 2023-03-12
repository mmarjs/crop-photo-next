import classNames from "classnames";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { OBJECT_TYPE } from "../../../common/Types";
import { Rating } from "react-simple-star-rating";
import Skeleton from "antd/lib/skeleton";
import Grid from "antd/lib/grid";
import styles from "./OverviewCard.module.scss";

const { useBreakpoint } = Grid;

export type Variant = {
  imageUrl: string;
  id?: string;
  selected?: boolean;
  round?: boolean;
};

type Price = {
  currency: string;
  symbol: string;
  amount: number;
  raw: string;
};

type Images = {
  main_id: string;
  variant_ids: string[];
};

export type OverviewData = {
  report_url: string;
  images: Images;
  marketplace: string;
  product_name: string;
  rating: number;
  reviewer_count: number;
  rating_count: number;
  price: Price;
};

interface OverviewProps {
  overview: OverviewData;
  imageURLs: OBJECT_TYPE;
  isLoading: boolean;
}

export default function Overview({ overview, imageURLs, isLoading }: OverviewProps) {
  const { t } = useTranslation();
  const screens = useBreakpoint();
  const mainImageURL = !!imageURLs && !!overview?.images ? imageURLs[overview?.images?.main_id] : "#";

  const variants = useMemo(() => {
    if (!!overview && overview?.images?.variant_ids?.length > 0) {
      return overview.images.variant_ids.map(variant => ({
        imageUrl: imageURLs[variant]
      }));
    }
    return [];
  }, [overview]);

  const goToListingLink = () => {
    window.open(overview.report_url, "_blank");
  };

  return (
    <div className={styles.OverviewCard} onClick={goToListingLink}>
      {isLoading ? (
        <>
          <div className={styles.cardMainImage}>
            <Skeleton.Image style={{ width: "400px", height: 200 }} />
          </div>

          <div style={{ width: "400px", height: "200px" }}>
            <Skeleton paragraph={{ rows: 4 }} />
            <Skeleton paragraph={{ rows: 3 }} />
          </div>
        </>
      ) : (
        <>
          <div className={styles.cardMainImage}>
            <img src={mainImageURL} />
          </div>
          <div className={styles.cardDetails}>
            <div className={styles.mobileContainer}>
              <div className={styles.cardMobileMainImage}>
                <img src={mainImageURL} onClick={goToListingLink} />
              </div>
              <div className={styles.cardHeader}>
                <img src="/images/amazon.svg" alt="amazon" className={styles.logo} />
                <h2 className={styles.cardTitle}>{overview?.product_name}</h2>
                <div className={styles.subtitle}>
                  <Rating
                    initialValue={overview?.rating}
                    ratingValue={0}
                    iconsCount={5}
                    transition
                    allowHalfIcon
                    fillColor="#F2A742"
                    size={screens.xs ? 14 : 20}
                    readonly
                    tooltipDefaultText={`${overview?.rating}/5`}
                  />

                  {overview?.rating_count > 0 ? (
                    <span className={styles.ratingsCount}>{overview?.rating_count} ratings</span>
                  ) : null}
                </div>

                <div className={styles.variantsContainer}>
                  <p className={styles.variantsContainerDesc}>
                    {t("main_report.variants_desc", {
                      count: overview?.images?.variant_ids?.length || 0
                    })}
                  </p>
                  <VariantList list={variants} isOverview />
                </div>
              </div>
            </div>
            <div className={styles.variantsMobileContainer}>
              <p className={styles.variantListDesc}>
                {variants?.length > 0
                  ? t("main_report.variants_desc", {
                      count: overview.images.variant_ids.length
                    })
                  : t("main_report.zero_variants_desc")}
              </p>
              <VariantList list={variants} isOverview />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function VariantList({
  list,
  listing,
  isOverview,
  onSelect,
  selectedId
}: {
  list: Variant[];
  isOverview?: boolean;
  listing?: boolean;
  onSelect?: (id: string) => void;
  selectedId?: string;
}) {
  const screens = useBreakpoint();
  if (!list || list?.length === 0) return null;

  const allowedLength = screens.sm || screens.xs ? 4 : 5;

  const visibleList = list?.length > allowedLength ? list.slice(0, allowedLength) : list;
  return (
    <div className={styles.variantsList}>
      {visibleList.map(variant => (
        <div
          key={variant.imageUrl}
          className={classNames("", {
            [styles.selectedOuterBorder]: selectedId === variant.id && !isOverview
          })}
        >
          <div
            className={classNames(styles.variant, {
              [styles.round]: variant?.round,
              [styles.selected]: selectedId === variant.id && !isOverview,
              [styles.overviewVariant]: isOverview,
              [styles.listingVariant]: listing
            })}
            onClick={() => {
              !!onSelect && onSelect(variant?.id || "");
            }}
          >
            {variant?.id === selectedId && !isOverview ? (
              <img src="/images/crown.svg" alt="crown" width={24} height={24} className={styles.variantBadge} />
            ) : null}
            {/* {listing ? (
              <img src="/images/success.svg" alt="crown" width={24} height={24} className={styles.successBadge} />
            ) : null} */}
            {/* {!variant.selected && variant.round ? <div className={styles.transparent} /> : null} */}
            <img src={variant.imageUrl} alt="#" className={styles.variantImage} />
          </div>
        </div>
      ))}
      {list?.length > allowedLength ? (
        <div className={styles.blurredVariant}>
          <img src={list[allowedLength].imageUrl} alt="blurred variant" className={styles.blurredImage} />
          <p className={styles.blurredText}>+{list.length - allowedLength}</p>
        </div>
      ) : null}
    </div>
  );
}

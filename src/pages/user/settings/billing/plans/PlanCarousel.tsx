/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
import Carousel from "react-multi-carousel";
import { UserCardData } from "../../../../../common/Classes";
import PlanContainer from "../../../../../ui-components/components/plan-config/PlanContainer";
import { CurrentPlan, PlanDetails } from "../../../../../ui-components/components/plan-config/PlanDetails";
import styles from "../../../../../styles/PlanContainer.module.css";
import "react-multi-carousel/lib/styles.css";

const carouselResponsive = {
  xtraLargeDesktop: {
    breakpoint: { max: 3000, min: 1801 },
    items: 4
  },
  largeDesktop: {
    breakpoint: { max: 1800, min: 1441 },
    items: 3
  },
  desktop: {
    breakpoint: { max: 1440, min: 1381 },
    items: 3
  },
  smallDesktop: {
    breakpoint: { max: 1380, min: 1036 },
    items: 2
  },
  tablet: {
    breakpoint: { max: 1035, min: 670 },
    items: 1,
    slidesToShow: 1
  }
};

interface PlansCarouselProps {
  plans: Array<PlanDetails>;
  userCardData: UserCardData;
  clientSecret: any;
  userPlanDetails: any;
  currentPlan: CurrentPlan | undefined;
  handleSelectPlan: (id: number) => void;
  setChangeInPlan: Function;
  onSuccessfulPayment: () => void;
}

export default function PlansCarousel({
  plans,
  userCardData,
  clientSecret,
  userPlanDetails,
  handleSelectPlan,
  setChangeInPlan,
  onSuccessfulPayment,
  currentPlan
}: PlansCarouselProps) {
  if (plans?.length > 0) {
    const generatedRecommendedPlan = plans.find(plan => plan?.planMetaData && plan?.planMetaData?.recommended);
    return (
      <Carousel
        additionalTransfrom={20}
        responsive={carouselResponsive}
        autoPlay={false}
        showDots={false}
        infinite={false}
        itemClass={styles.CarouselPlanContainer}
        containerClass={styles.CarouselContainer}
        //@ts-ignore
        customLeftArrow={<CustomLeftArrow />}
        //@ts-ignore
        customRightArrow={<CustomRightArrow />}
      >
        {plans.map(plan => (
          <div key={plan.planName} className={styles.planContainerWrapper}>
            <PlanContainer
              onSuccessfulPayment={onSuccessfulPayment}
              userCardData={userCardData}
              selectedPlan={plan}
              clientSecret={clientSecret}
              userPlan={userPlanDetails}
              onSelectPlan={handleSelectPlan}
              setChangeInPlan={setChangeInPlan}
              recommendedPlan={generatedRecommendedPlan}
              currentPlan={currentPlan}
            />
          </div>
        ))}
      </Carousel>
    );
  }

  return null;
}

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

const CustomLeftArrow = ({ onClick, ...rest }: CustomArrowProps) => {
  return <img src={"/images/previous-icon.svg"} className={styles.previousIcon} onClick={() => onClick()} />;
};

const CustomRightArrow = ({ onClick, ...rest }: CustomArrowProps) => {
  return <img src={"/images/nextarrow-icon.svg"} onClick={() => onClick()} className={styles.nextIcon} />;
};

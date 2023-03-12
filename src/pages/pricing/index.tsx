import { useCallback, useRef, useState } from "react";
import { VLayout } from "../../ui-components/components/vLayout";
import styles from "../../styles/Pricing.module.css";
import { PricingToggle } from "../../ui-components/components/pricing-toggle";
import { PlanCard } from "../../ui-components/components/plan-card";

import IconRight from "../../../public/images/chevron-right.svg";
import classNames from "classnames";

const Pricing = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [period, setPeriod] = useState<"monthly" | "annual">("monthly");
  const [isScrollLeft, setIsScrollLeft] = useState(false);
  const [isScrollRight, setIsScrollRight] = useState(true);
  const plans = [
    {
      name: "Free",
      price: 0,
      services: [
        {
          title: "Up to 10 free crops",
          info: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        },
        {
          title: "Unlimited automations",
          info: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        },
        {
          title: "Unlimited downloads",
          info: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        },
        {
          title: "Full access to Smart Crop",
          info: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        },
        {
          title: "7 days free storage",
          info: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        }
      ]
    },
    {
      name: "Essential",
      price: 25,
      services: [
        {
          title: "Up to 100 crops",
          info: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        },
        {
          title: "$0.25 per crop after limit",
          info: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        },
        {
          title: "Unlimited automations",
          info: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        },
        {
          title: "Unlimited downloads",
          info: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        },
        {
          title: "Full access to Smart Crop",
          info: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        },
        {
          title: "6 months free storage",
          info: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        }
      ],
      recommended: true
    },
    {
      name: "Studio",
      price: 200,
      services: [
        {
          title: "Up to 1,000 crops",
          info: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        },
        {
          title: "$0.20 per crop after limit",
          info: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        },
        {
          title: "Unlimited automations",
          info: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        },
        {
          title: "Unlimited downloads",
          info: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        },
        {
          title: "Full access to Smart Crop",
          info: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        },
        {
          title: "6 months free storage",
          info: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        }
      ]
    },
    {
      name: "Enterprise",
      price: 1500,
      services: [
        {
          title: "Up to 10,000 crops",
          info: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        },
        {
          title: "$0.15 per crop after limit",
          info: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        },
        {
          title: "Unlimited automations",
          info: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        },
        {
          title: "Unlimited downloads",
          info: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        },
        {
          title: "Full access to Smart Crop",
          info: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        },
        {
          title: "6 months free storage",
          info: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        }
      ]
    }
  ];

  const scrollLeft = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
      setIsScrollLeft(false);
      setIsScrollRight(true);
    }
  }, [scrollRef]);

  const scrollRight = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;
      setIsScrollLeft(true);
      setIsScrollRight(false);
    }
  }, [scrollRef]);

  return (
    <VLayout noFlex={true} noMargin={true} className={styles.Wrapper} gap={56}>
      <VLayout noFlex={true} noMargin={true} gap={8} style={{ alignItems: "center" }}>
        <PricingToggle value={period} toggleValue={setPeriod} />
        {period === "annual" && <p className={styles.AnnualBenefit}>Save up to 20% when you choose annually</p>}
      </VLayout>
      <div className={styles.CardView}>
        {isScrollLeft && (
          <a className={classNames(styles.BtnScroll, styles.BtnScrollReverse)} onClick={scrollLeft}>
            <IconRight />
          </a>
        )}
        <div className={styles.CardScroller} ref={scrollRef}>
          <div className={styles.CardList}>
            {plans.map((plan, idx) => (
              <PlanCard key={idx} {...plan} period={period} />
            ))}
          </div>
        </div>
        {isScrollRight && (
          <a className={styles.BtnScroll} onClick={scrollRight}>
            <IconRight />
          </a>
        )}
      </div>
    </VLayout>
  );
};

export default Pricing;

import { HLayout } from "../hLayout";
import { VLayout } from "../vLayout";
import styles from "./plan-card.module.scss";
import classNames from "classnames";

import InfoIcon from "../../../../public/images/info.svg";
import { Tooltip } from "../tooltip";

type PlanCardProps = {
  period: string;
  price: number;
  name: string;
  services: { title: string; info: string }[];
  recommended?: boolean;
};

const PlanCard = ({ period, price, name, services, recommended = false }: PlanCardProps) => {
  const getCost = () => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(period === "monthly" ? price : Math.round(price * 12 * 0.8));
  };

  return (
    <VLayout gap={32} noMargin={true} noFlex={true} className={styles.CardWrapper}>
      <VLayout gap={8} noMargin={true}>
        <span className={styles.Name}>{name}</span>
        <HLayout noFlex={true} noPadding={true} gap={10}>
          <h5 className={styles.Price}>{getCost()}</h5>
          {price > 0 && <span className={styles.Period}>per {period === "monthly" ? "month" : "year"}</span>}
        </HLayout>
      </VLayout>
      <VLayout noMargin={true} gap={8} style={{ width: "100%" }}>
        {services.map((service, idx) => (
          <p key={idx} className={styles.Service}>
            {service.title}
            <Tooltip title={service.info} placement="top" color="#061425">
              <InfoIcon />
            </Tooltip>
          </p>
        ))}
      </VLayout>
      <div className={styles.Flex} />
      <button
        className={classNames(styles.GoButton, {
          [styles.FreeButton]: price === 0
        })}
      >
        {price === 0 ? "Try for free" : "Get started"}
      </button>
      {recommended && <div className={styles.Recommended}>Recommended</div>}
    </VLayout>
  );
};

export default PlanCard;

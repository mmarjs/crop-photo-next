import { Radio } from "antd";
import styles from "./pricing-toggle.module.scss";

type PricingToggleProps = {
  value: "monthly" | "annual";
  toggleValue?: Function;
};

const PricingToggle = ({ value, toggleValue }: PricingToggleProps) => {
  return (
    <Radio.Group value={value} onChange={e => toggleValue && toggleValue(e.target.value)} className={styles.Wrapper}>
      <Radio.Button value="monthly">Monthly</Radio.Button>
      <Radio.Button value="annual">Annual</Radio.Button>
    </Radio.Group>
  );
};

export default PricingToggle;

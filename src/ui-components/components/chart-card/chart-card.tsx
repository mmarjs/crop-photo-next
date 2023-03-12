import classNames from "classnames";
import { ComponentProp } from "../../../common/Types";
import styles from "./chart-card.module.scss";

export type ChartDataItem = {
  name: string;
  value: number;
  formatted: string;
};

type ChartCardProps = ComponentProp & {
  header: string;
  data: ChartDataItem[];
  label: string;
};

const ChartCard = ({ header, data, label, className }: ChartCardProps) => {
  const colors = ["#D478FF", "#00109F"];

  return (
    <div className={classNames(styles.Wrapper, className)}>
      <h5 className={styles.Header}>{header}</h5>
      <div className={styles.ChartView}>
        {/* <PieChart width={220} height={110}>
          <Pie
            data={data}
            cx={105}
            cy={110}
            innerRadius={88}
            outerRadius={110}
            startAngle={180}
            endAngle={0}
            paddingAngle={0}
            dataKey="value"
          >
            {data.map((_, idx) => (
              <Cell key={idx} fill={colors[idx]} />
            ))}
          </Pie>
        </PieChart> */}
        <div className={styles.ChartLabel}>
          <span>{Number((1 - data[0].value / data[1].value) * 100).toFixed(1)}%</span>
          <span>{label}</span>
        </div>
      </div>
      <div className={styles.Footer}>
        {data.map(({ name, formatted }, idx) => (
          <div className={styles.FooterItem} key={idx}>
            <span className={styles.FooterItemDot} style={{ backgroundColor: colors[idx] }} />
            <div>
              <span className={styles.FooterItemName}>{name}</span>
              <span className={styles.FooterItemValue} style={{ color: colors[idx] }}>
                {formatted}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartCard;

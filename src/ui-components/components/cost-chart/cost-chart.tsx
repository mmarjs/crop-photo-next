import React from "react";
import { ChartCard, ChartDataItem } from "../chart-card";

type CostChartProps = {
  automationCost: number;
  humanCost: number;
  className: string;
};

const CostChart = ({ className, automationCost, humanCost }: CostChartProps) => {
  const data: ChartDataItem[] = [
    {
      name: "Crop.photo",
      value: 0,
      formatted: "$0"
    },
    {
      name: "Human labor",
      value: 2406.03,
      formatted: "$2406.03"
    }
  ];

  return <ChartCard className={className} header="Total cost" data={data} label="Savings" />;
};

export default CostChart;

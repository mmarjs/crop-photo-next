import React from "react";
import { ChartCard, ChartDataItem } from "../chart-card";

type TimeChartProps = {
  automationTime: number;
  humanTime: number;
};

const TimeChart = ({ automationTime, humanTime }: TimeChartProps) => {
  const data: ChartDataItem[] = [
    {
      name: "Crop.photo",
      value: 1,
      formatted: "9m"
    },
    {
      name: "Human labor",
      value: 99,
      formatted: "9h30"
    }
  ];

  return <ChartCard header="Total time" data={data} label="Efficiency" />;
};

export default TimeChart;

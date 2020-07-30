import React, { useRef, useEffect, useState, useMemo } from "react";
import echarts from "echarts";
import { getOptions } from "../modules/chart";
import { Radio } from "./radio";

export default function Chart({ data }) {
  const ref = useRef(null);
  const [myChart, setChart] = useState(null);
  const [dimension, setDimension] = useState("year");
  const [year, setYear] = useState(data[0].label);
  const [month, setMonth] = useState(1);

  const yearOptions = useMemo(() => {
    return data.map((y) => ({
      label: `${y.label}年`,
      value: y.label,
    }));
  }, [data]);
  const monthOptions = useMemo(() => {
    const options = [];
    for (let i = 1; i <= 12; i++) {
      options.push({
        label: `${i}月`,
        value: i,
      });
    }
    return options;
  }, []);

  useEffect(() => {
    console.log("init render");
    var myChart = echarts.init(ref.current);
    var option = getOptions(data, { dimension, year, month });
    myChart.setOption(option);
    setChart(myChart);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (myChart) {
      console.log("refresh render");
      var option = getOptions(data, { dimension, year, month });
      myChart.setOption(option);
    }
  }, [myChart, dimension, year, month, data]);

  return (
    <div>
      <div>
        维度选择：
        <Radio
          name="dimension"
          value={dimension}
          onChange={setDimension}
          options={[
            { label: "年", value: "year" },
            { label: "月", value: "month" },
            { label: "日", value: "day" },
          ]}
        />
      </div>
      {dimension !== "year" ? (
        <div>
          年：
          <Radio
            name="year"
            value={+year}
            onChange={setYear}
            options={yearOptions}
          />
        </div>
      ) : null}
      {dimension === "day" ? (
        <div>
          月：
          <Radio
            name="month"
            value={+month}
            onChange={setMonth}
            options={monthOptions}
          />
        </div>
      ) : null}
      <div style={{ width: "100%", height: "600px" }} ref={ref} />
    </div>
  );
}

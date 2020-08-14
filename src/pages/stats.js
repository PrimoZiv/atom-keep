import React, { useState, useContext, useRef, useMemo, useEffect } from "react";
import echarts from "echarts";
import { Divider, Radio } from "antd";

import StoreContext from "../modules/context";
import { getOptions } from "../modules/stats.option";

import style from "./stats.module.css";

const Stats = () => {
  const { store } = useContext(StoreContext);
  const { data } = store;
  const ref = useRef(null);
  const [myChart, setChart] = useState(null);
  const [dimension, setDimension] = useState("year");
  const [year, setYear] = useState(
    data.length > 0 ? data[data.length - 1].label : ""
  );
  const [month, setMonth] = useState("");
  console.log(data);

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
    var myChart = echarts.init(ref.current);
    var option = getOptions(data, { dimension, year, month });
    myChart.setOption(option);
    setChart(myChart);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (myChart) {
      var option = getOptions(data, { dimension, year, month });
      myChart.setOption(option);
    }
  }, [myChart, dimension, year, month, data]);

  return (
    <div>
      <div className={style.filter}>
        <div>
          维度选择：
          <Radio.Group
            onChange={(e) => setDimension(e.target.value)}
            value={dimension}
          >
            {[
              { label: "全部数据", value: "all" },
              { label: "年", value: "year" },
              { label: "月", value: "month" },
            ].map((o) => (
              <Radio key={o.value} value={o.value}>
                {o.label}
              </Radio>
            ))}
          </Radio.Group>
        </div>
        {dimension !== "all" ? (
          <div>
            年份选择：
            <Radio.Group
              onChange={(e) => setYear(e.target.value)}
              value={+year}
            >
              {yearOptions.map((o) => (
                <Radio key={o.value} value={o.value}>
                  {o.label}
                </Radio>
              ))}
            </Radio.Group>
          </div>
        ) : null}
        {dimension === "month" ? (
          <div>
            月：
            <Radio.Group
              onChange={(e) => setMonth(e.target.value)}
              value={+month}
            >
              {monthOptions.map((o) => (
                <Radio key={o.value} value={o.value}>
                  {o.label}
                </Radio>
              ))}
            </Radio.Group>
          </div>
        ) : null}
      </div>
      <Divider />
      <div style={{ width: "100%", height: "400px" }} ref={ref} />
    </div>
  );
};

export default Stats;

import React, {
  useState,
  useContext,
  useRef,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import echarts from "echarts";
import { Divider, Radio } from "antd";

import StoreContext from "../modules/context";
import { getOptions } from "../modules/stats.option";

import style from "./stats.module.css";

const chartWidth = window.innerWidth - 70;
const chartHeight = window.innerHeight - 180;

const Stats = () => {
  const { store } = useContext(StoreContext);
  const { data } = store;
  const ref = useRef(null);
  const [myChart, setChart] = useState(null);
  const [dimension, setDimension] = useState("year");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");

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
  const handleDimension = (e) => {
    const dim = e.target.value;
    if (dim === "month" && !year) {
      setYear(data.length > 0 ? data[data.length - 1].label : "");
    } else if (dim === "day") {
      if (!year) {
        setYear(data.length > 0 ? data[data.length - 1].label : "");
      }
      if (!month) {
        setMonth(1);
      }
    }
    setDimension(dim);
  };
  const handleChart = useCallback(
    (e) => {
      const option = getOptions(data, {
        dimension,
        year,
        month,
        dataIndex: e.dataIndex === undefined ? null : e.dataIndex,
      });
      if (option) {
        console.log(option);
        myChart.setOption(option, true);
      }
    },
    [data, dimension, month, myChart, year]
  );

  useEffect(() => {
    const myChart = echarts.init(ref.current);
    const option = getOptions(data, {
      dimension,
      year,
      month,
      dataIndex: null,
    });
    myChart.setOption(option);
    setChart(myChart);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (myChart) {
      const option = getOptions(data, { dimension, year, month });
      if (option) {
        console.log(option);
        myChart.setOption(option, true);
      }
    }
  }, [myChart, dimension, year, month, data]);

  useEffect(() => {
    if (myChart) {
      myChart.off("updateAxisPointer");
      myChart.on("updateAxisPointer", handleChart);
    }
  }, [myChart, handleChart]);

  return (
    <div>
      <div className={style.filter}>
        <div>
          维度选择：
          <Radio.Group onChange={handleDimension} value={dimension}>
            {[
              { label: "年", value: "year" },
              { label: "月", value: "month" },
              { label: "日", value: "day" },
            ].map((o) => (
              <Radio key={o.value} value={o.value}>
                {o.label}
              </Radio>
            ))}
          </Radio.Group>
        </div>
        {dimension !== "year" ? (
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
        {dimension === "day" ? (
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
      <div ref={ref} style={{ width: chartWidth, height: chartHeight }} />
    </div>
  );
};

export default Stats;

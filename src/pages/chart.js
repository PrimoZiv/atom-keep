import React, { useRef, useEffect, useState, useMemo, useContext } from "react";
import echarts from "echarts";
import { Radio, Divider } from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import StoreContext from "../modules/context";
import { getOptions } from "../modules/chart.option";

import style from "./chart.module.css";

export default function Chart() {
  const { store } = useContext(StoreContext);
  const { data = [] } = store;
  const ref = useRef(null);
  const [myChart, setChart] = useState(null);
  const [incomeVisible, setIncomeVisible] = useState(false);
  const [dimension, setDimension] = useState("year");
  const [year, setYear] = useState(
    data.length > 0 ? data[data.length - 1].label : ""
  );

  const yearOptions = useMemo(() => {
    return data.map((y) => ({
      label: `${y.label}年`,
      value: y.label,
    }));
  }, [data]);

  useEffect(() => {
    var myChart = echarts.init(ref.current);
    var option = getOptions(data, { dimension, year });
    myChart.setOption(option);
    setChart(myChart);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (myChart) {
      var option = getOptions(data, { dimension, year, incomeVisible });
      myChart.setOption(option, true);
    }
  }, [myChart, dimension, year, data, incomeVisible]);

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
              { label: "年", value: "year" },
              { label: "月", value: "month" },
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
              {dimension === "month" ? (
                <Radio key="-1" value={-1}>
                  全部
                </Radio>
              ) : null}
              {yearOptions.map((o) => (
                <Radio key={o.value} value={o.value}>
                  {o.label}
                </Radio>
              ))}
            </Radio.Group>
          </div>
        ) : null}
      </div>
      <Divider />
      <div>
        <div className={style.visibleCtrl}>
          <span onClick={() => setIncomeVisible(!incomeVisible)}>
            {incomeVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />} 收入
          </span>
        </div>
        <div style={{ width: "100%", height: "600px" }} ref={ref} />
      </div>
    </div>
  );
}

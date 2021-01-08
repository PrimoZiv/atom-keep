import React, { useRef, useEffect, useState, useMemo, useContext } from "react";
import echarts from "echarts";
import moment from "moment";
import { Radio, Divider, InputNumber, DatePicker, Form } from "antd";
import StoreContext from "../modules/context";
import { getOptions } from "../modules/chart.option";

import style from "./chart.module.css";

let fixPay = localStorage.getItem("perMonthFixPay") || 0;
let startTime = localStorage.getItem("perMonthFixPayStartTime") || moment();

export default function Chart() {
  const { store } = useContext(StoreContext);
  const { data = [] } = store;
  const ref = useRef(null);
  const [myChart, setChart] = useState(null);
  const [dimension, setDimension] = useState("all");
  const [year, setYear] = useState(
    data.length > 0 ? data[data.length - 1].label : ""
  );
  const [form] = Form.useForm();
  const [chartWidth, setChartWidth] = useState(window.innerWidth - 100);
  const [chartHeight, setChartHeight] = useState(window.innerHeight - 240);

  const yearOptions = useMemo(() => {
    return data.map((y) => ({
      label: `${y.label}年`,
      value: y.label,
    }));
  }, [data]);

  const handleChangeValues = (values) => {
    localStorage.setItem("perMonthFixPay", values.fixPay);
    localStorage.setItem("perMonthFixPayStartTime", values.startTime);
    fixPay = values.fixPay;
    startTime = values.startTime;

    if (myChart) {
      var option = getOptions(data, {
        dimension,
        year,
        ...values,
      });
      myChart.setOption(option, true);
    }
  };

  const handleDimension = (e) => {
    if (e.target.value === "year") {
      setYear(data.length > 0 ? data[data.length - 1].label : "");
    }
    setDimension(e.target.value);
  };

  useEffect(() => {
    var myChart = echarts.init(ref.current);
    myChart.on("legendselectchanged", (e) => {
      sessionStorage.setItem(
        "chart_legend_selected",
        JSON.stringify(e.selected)
      );
    });
    setChart(myChart);
    return () => {
      sessionStorage.removeItem("chart_legend_selected");
    };
  }, []);

  useEffect(() => {
    if (myChart) {
      var option = getOptions(data, {
        dimension,
        year,
        fixPay,
        startTime,
      });
      myChart.setOption(option, true);
    }
  }, [myChart, dimension, year, data]);

  useEffect(() => {
    let timer;
    const handleResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setChartWidth(window.innerWidth - 100);
        setChartHeight(window.innerHeight - 240);
      }, 500);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (myChart && chartWidth && chartHeight) {
      myChart.resize({
        width: chartWidth,
        height: chartHeight,
      });
    }
  }, [myChart, chartWidth, chartHeight]);

  return (
    <div>
      <div className={style.filter}>
        <div>
          维度选择：
          <Radio.Group onChange={handleDimension} value={dimension}>
            {[
              { label: "全部", value: "all" },
              { label: "年", value: "year" },
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
      </div>
      <Divider />
      <div>
        <div className={style.visibleCtrl}>
          <Form
            name="固定支出"
            form={form}
            onValuesChange={(a1, all) => handleChangeValues(all)}
            layout="inline"
            initialValues={{ fixPay, startTime: moment(startTime) }}
          >
            <Form.Item name="fixPay" label="固定支出配置">
              <InputNumber />
            </Form.Item>
            <Form.Item name="startTime" label="开始时间">
              <DatePicker />
            </Form.Item>
          </Form>
        </div>
        <div
          style={{ width: `${chartWidth}px`, height: `${chartHeight}px` }}
          ref={ref}
        />
      </div>
    </div>
  );
}

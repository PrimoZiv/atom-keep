import React, {
  useState,
  useContext,
  useRef,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import moment from "moment";
import echarts from "echarts";
import { Divider, Radio, Table } from "antd";

import StoreContext from "../modules/context";
import { getOptions } from "../modules/stats.option";

import style from "./stats.module.css";

const topColumns = [
  {
    title: "类别",
    width: 60,
    dataIndex: "category",
  },
  {
    title: "金额",
    width: 100,
    dataIndex: "amount",
    render: (v) => `￥${v}`,
  },
  {
    title: "账户",
    width: 150,
    dataIndex: "account",
  },
  {
    title: "时间",
    width: 150,
    dataIndex: "time",
    render: (v) => moment(v).format("YYYY-MM-DD HH:mm"),
  },
  {
    title: "备注",
    dataIndex: "remark",
  },
];

const Stats = () => {
  const { store } = useContext(StoreContext);
  const { data, rawData } = store;
  const ref = useRef(null);
  const [myChart, setChart] = useState(null);
  const [dimension, setDimension] = useState("all");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");

  const [dataSource, setDataSource] = useState([]);
  const [chartWidth, setChartWidth] = useState(window.innerWidth - 70);
  const [chartHeight, setChartHeight] = useState(window.innerHeight - 180);

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
    if (dim === "year" && !year) {
      setYear(data.length > 0 ? data[data.length - 1].label : "");
    } else if (dim === "month") {
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
        myChart.setOption(option, true);
      }
    },
    [data, dimension, month, myChart, year]
  );
  const handlePieSelect = useCallback(
    (event) => {
      switch (dimension) {
        case "all":
          const allData = [];
          rawData.forEach((r) => {
            allData.push(...r.outgo);
          });
          const allTop = allData
            .filter((x) => x.category === event.name)
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 30);
          setDataSource(allTop);
          break;
        case "year":
          const yearData = rawData.find((r) => r.label === +year);
          if (yearData) {
            const yearAll = [...yearData.outgo];
            const yearTop = yearAll
              .filter((x) => x.category === event.name)
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 20);
            setDataSource(yearTop);
          }
          break;
        case "month":
          const monthStr = `${year}-${month}-01 00:00:00`;
          const monthStart = moment(monthStr).startOf("month").valueOf();
          const monthEnd = moment(monthStr).endOf("month").valueOf();
          const yData = rawData.find((r) => r.label === +year);
          if (yData) {
            const yAll = [...yData.outgo];
            const monthData = yAll.filter(
              (x) => x.time >= monthStart && x.time <= monthEnd
            );
            const monthTop = monthData
              .filter((x) => x.category === event.name)
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 20);
            setDataSource(monthTop);
          }
          break;
        default:
      }
    },
    [rawData, dimension, year, month]
  );

  useEffect(() => {
    const myChart = echarts.init(ref.current);
    const option = getOptions(data, {
      dimension,
      year,
      month,
      dataIndex: null,
    });
    if (option) {
      myChart.setOption(option);
    }
    setChart(myChart);
    return () => {
      myChart.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!myChart) {
      return;
    }
    myChart.off("click", handlePieSelect);
    myChart.on("click", handlePieSelect);
  }, [myChart, handlePieSelect]);

  useEffect(() => {
    if (myChart) {
      const option = getOptions(data, { dimension, year, month });
      if (option) {
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

  useEffect(() => {
    let timer;
    const handleResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setChartWidth(window.innerWidth - 70);
        setChartHeight(window.innerHeight - 180);
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
              { label: "所有", value: "all" },
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
      <div className={style.canvasWrapper}>
        <div className={style.topItems}>
          <Table
            scroll={{
              scrollToFirstRowOnChange: true,
              y: `${chartHeight / 2.2}px`,
            }}
            size="small"
            rowKey="id"
            pagination={false}
            columns={topColumns}
            dataSource={dataSource}
          />
        </div>
        <div ref={ref} style={{ width: chartWidth, height: chartHeight }} />
      </div>
    </div>
  );
};

export default Stats;

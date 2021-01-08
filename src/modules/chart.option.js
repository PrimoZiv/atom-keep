import moment from "moment";

export function getOptions(data, params) {
  const { dimension, year, month, fixPay = 0, startTime } = params;
  const legendSelected = sessionStorage.getItem("chart_legend_selected");
  const legendSelectedValue = legendSelected
    ? JSON.parse(legendSelected)
    : {
        支出: true,
        收入: false,
        结余: false,
      };
  let target = data;
  let xAxisUnit = "";
  switch (dimension) {
    case "all":
      xAxisUnit = "年";
      break;
    case "year":
      if (year) {
        if (+year === -1) {
          target = [];
          data.forEach((d) => {
            d.children.forEach((c) => {
              const m = `${c.label}`.padStart(2, "0");
              target.push({
                ...c,
                label: `${d.label}/${m}`,
              });
            });
          });
        } else {
          target = data.find((y) => y.label === +year).children;
        }
        xAxisUnit = "月";
      }
      break;
    case "month":
      const yearData = data.find((y) => y.label === +year).children;
      target = yearData.find((y) => y.label === +month).children;
      xAxisUnit = "日";
      break;
    default:
  }

  const series = [
    {
      name: "支出",
      data: target.map((d) => d.outgo),
      type: "line",
    },
  ];

  series.push({
    name: "收入",
    data: target.map((d) => d.income),
    type: "line",
  });

  if (dimension === "year") {
    const data = target.map((d) => {
      const currentMoment = moment(`${year}-${d.label}-2`);
      if (startTime) {
        const pay = moment(startTime).isBefore(currentMoment) ? fixPay : 0;
        return (d.income - pay - d.outgo).toFixed(2);
      } else {
        return (d.income - fixPay - d.outgo).toFixed(2);
      }
    });
    series.push({
      name: "结余",
      data,
      type: "line",
    });
  }

  return {
    color: ["#e25858", "#48af48", "#1890ff"],
    legend: {
      show: true,
      icon: "pin",
      selected: legendSelectedValue,
    },
    xAxis: {
      type: "category",
      axisTick: {
        alignWithLabel: true,
      },
      axisLabel: {
        formatter: `{value}${xAxisUnit}`,
      },
      data: target.map((d) => d.label),
    },
    yAxis: {
      type: "value",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        animation: false,
      },
    },
    series,
  };
}

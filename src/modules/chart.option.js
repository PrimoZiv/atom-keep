import moment from "moment";

export function getOptions(data, params) {
  const { dimension, year, month, fixPay = 0, startTime } = params;
  let target = data;
  switch (dimension) {
    case "all":
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
      }
      break;
    case "month":
      const yearData = data.find((y) => y.label === +year).children;
      target = yearData.find((y) => y.label === +month).children;
      break;
    default:
  }

  const series = [
    {
      name: "支出",
      data: target.map((d) => d.outgo),
      type: "line",
      lineStyle: {
        color: "#e25858",
      },
    },
  ];

  series.push({
    name: "收入",
    data: target.map((d) => d.income),
    type: "line",
    lineStyle: {
      color: "#48af48",
    },
  });

  if (dimension === "year") {
    const data = target.map((d) => {
      const currentMoment = moment(`${year}-${d.label}-2`);
      if (startTime) {
        const pay = moment(startTime).isBefore(currentMoment) ? fixPay : 0;
        return d.income - pay - d.outgo;
      } else {
        return d.income - fixPay - d.outgo;
      }
    });
    series.push({
      name: "结余",
      data,
      type: "line",
      lineStyle: {
        color: "#1890ff",
      },
    });
  }

  return {
    legend: {
      show: true,
      selected: {
        支出: true,
        收入: false,
        结余: false,
      },
    },
    xAxis: {
      type: "category",
      axisTick: {
        alignWithLabel: true,
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

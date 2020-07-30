export function getOptions(data, params) {
  const { dimension, year, month } = params;
  let target = data;
  switch (dimension) {
    case "year":
      break;
    case "month":
      if (year) {
        target = data.find((y) => y.label === +year).children;
      }
      break;
    case "day":
      const yearData = data.find((y) => y.label === +year).children;
      target = yearData.find((y) => y.label === +month).children;
      break;
    default:
  }
  return {
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
      formatter: function (params) {
        return `out: ${params[0].value} / in: ${params[1].value}`;
      },
      axisPointer: {
        animation: false,
      },
    },
    series: [
      {
        data: target.map((d) => d.outgo),
        type: "line",
        lineStyle: {
          color: "#e25858",
        },
      },
      {
        data: target.map((d) => d.income),
        type: "line",
        lineStyle: {
          color: "#48af48",
        },
      },
    ],
  };
}

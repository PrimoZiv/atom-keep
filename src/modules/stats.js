export function getOptions(data, params) {
  const { dimension, year, month } = params;
  let target = data;
  switch (dimension) {
    case "year":
      break;
    case "month":
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
        return `<h3 style="color:white;">${params[0].name}</h3><div>out: ${params[0].value}</div><div>in: ${params[1].value}</div>`;
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

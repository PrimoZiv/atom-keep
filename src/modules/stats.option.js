const colors = [
  "#ccee66",
  "#006699",
  "#99cc33",
  "#3399cc",
  "#990066",
  "#ff6600",
  "#ff9900",
  "#cc3399",
  "#669900",
  "#ffcc00",
];

export function getOptions(data, params) {
  const { dimension, year, month } = params;
  let target = {};
  let labels = [];
  switch (dimension) {
    case "year":
      data.forEach((d) => {
        const cates = d.categorys.outgo;
        labels.push(d.label);
        Object.keys(cates).forEach((c) => {
          if (!target[c]) {
            target[c] = [];
          }
          target[c].push({
            value: cates[c],
            label: d.label,
          });
        });
      });
      break;
    case "month":
      break;
    case "day":
      break;
    default:
  }
  console.log(target);
  return {
    color: colors,
    legend: {},
    xAxis: {
      type: "category",
      axisTick: {
        alignWithLabel: true,
      },
      data: labels,
    },
    yAxis: {
      type: "value",
    },
    tooltip: {
      trigger: "axis",
      formatter: function (params) {
        let str = "";
        params
          .map((p) => ({ name: p.seriesName, value: p.value }))
          .sort((a, b) => b.value - a.value)
          .forEach((p) => (str += `${p.name}: ${p.value}<br>`));
        return `<h3 style="color:white;">${params[0].name}</h3>${str}`;
      },
      axisPointer: {
        animation: false,
      },
    },
    series: Object.keys(target).map((k, i) => {
      return {
        data: labels.map((l) => {
          const t = target[k].find((x) => x.label === l);
          return t ? t.value : 0;
        }),
        type: "line",
        name: k,
        smooth: true,
      };
    }),
  };
}

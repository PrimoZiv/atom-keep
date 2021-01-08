const toFixed = (n) => +n.toFixed(2);

const getCatesFromData = (data) => {
  let tar = {};
  let lab = [];
  data.forEach((d) => {
    const label = `${d.label}`;
    const cates = d.categorys.outgo;
    lab.push(label);
    Object.keys(cates).forEach((c) => {
      if (!tar[c]) {
        tar[c] = [];
      }
      tar[c].push({
        value: cates[c],
        label,
      });
    });
  });
  return { tar, lab };
};

let dataCache = [];
let paramsCache = {};

export function getOptions(data, params) {
  const { dimension, year, month, dataIndex } = params;

  if (
    data === dataCache &&
    dimension === paramsCache.dimension &&
    year === paramsCache.year &&
    month === paramsCache.month &&
    dataIndex === paramsCache.dataIndex
  ) {
    return null;
  }
  dataCache = data;
  paramsCache = params;

  let target = {};
  let labels = [];
  let xAxisUnit = '';
  switch (dimension) {
    case "all":
      const { tar, lab } = getCatesFromData(data);
      target = tar;
      labels = lab;
      xAxisUnit = '年';
      break;
    case "year":
      if (year) {
        const y = data.find((x) => x.label === year) || {};
        const { tar, lab } = getCatesFromData(y.children || []);
        target = tar;
        labels = lab;
        xAxisUnit = '月';
      }
      break;
    case "month":
      if (year && month) {
        const y = data.find((x) => x.label === year) || {};
        const m = (y.children || []).find((x) => x.label === month) || {};
        const { tar, lab } = getCatesFromData(m.children || []);
        target = tar;
        labels = lab;
        xAxisUnit = '日';
      }
      break;
    default:
  }

  const keys = Object.keys(target);
  const datasource = [["product", ...labels]];
  const pieData = [];
  keys.forEach((k) => {
    const data = [];
    const pie = {
      name: k,
      value: 0,
    };
    labels.forEach((l) => {
      const t = target[k].find((x) => x.label === l);
      data.push(t ? t.value : 0);
    });
    datasource.push([k, ...data]);
    if (dataIndex != null) {
      pie.value = toFixed(data[dataIndex]);
    } else {
      pie.value = toFixed(data.reduce((v1, v2) => v1 + v2));
    }
    pieData.push(pie);
  });

  pieData.sort((a, b) => b.value - a.value);
  datasource.sort((a, b) => {
    if (a[0] === "product") {
      return -1;
    }
    if (b[0] === "product") {
      return 1;
    }
    const a1 = a.slice(1).reduce((v1, v2) => v1 + v2);
    const b1 = b.slice(1).reduce((v1, v2) => v1 + v2);
    return b1 - a1;
  });

  return {
    legend: {
      orient: "vertical",
      left: "5%",
      top: "20%",
      itemGap: 20,
    },
    dataset: {
      source: datasource,
    },
    xAxis: {
      type: "category",
      axisTick: {
        alignWithLabel: true,
      },
      axisLabel: {
        formatter: `{value}${xAxisUnit}`
      },
      data: labels,
    },
    yAxis: {
      type: "value",
    },
    grid: {
      top: "50%",
      left: "240",
      right: "100",
    },
    tooltip: {
      trigger: "axis",
      formatter: function (params) {
        let str = "";
        let total = 0;
        params
          .map((p) => ({
            name: p.dimensionNames[p.seriesIndex + 1],
            value: p.data[p.seriesIndex + 1],
          }))
          .sort((a, b) => b.value - a.value)
          .forEach((p) => {
            str += `${p.name}: ${p.value}<br>`;
            total += p.value;
          });
        total = `￥${toFixed(total)}`;
        return `<h3 style="color:white;">${params[0].name}${xAxisUnit} ${total}</h3>${str}`;
      },
      axisPointer: {
        animation: false,
      },
    },
    series: [
      ...pieData.map((p, i) => {
        return {
          animation: false,
          type: "line",
          name: p.name,
          smooth: true,
          seriesLayoutBy: "row",
        };
      }),
      {
        type: "pie",
        radius: "25%",
        center: ["30%", "25%"],
        label: {
          formatter: "{b}: {c} ({d}%)",
          fontSize: 16,
          fontWeight: 600,
        },
        data: pieData,
      },
    ],
  };
}

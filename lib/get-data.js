const moment = require("moment");
const getFileNames = require("./get-file-names");
const getFileContent = require("./get-file-content");

const getAmount = (n) => +n.replace("¥", "");
const toFixed = (n) => +n.toFixed(2);
const d = (d) => new Date(d);

function addCateData(d1, d2) {
  const cateMap = {
    outgo: {},
    income: {},
  };
  ["outgo", "income"].forEach((t) => {
    Object.keys(d1[t]).forEach((k) => {
      cateMap[t][k] = cateMap[t][k] || 0;
      cateMap[t][k] = toFixed(cateMap[t][k] + d1[t][k]);
    });
    Object.keys(d2[t]).forEach((k) => {
      cateMap[t][k] = cateMap[t][k] || 0;
      cateMap[t][k] = toFixed(cateMap[t][k] + d2[t][k]);
    });
  });
  return cateMap;
}

function getMonthData(start, end, content) {
  const startTime = start.valueOf();
  const endTime = end.valueOf();
  const data = [];
  const cateMap = {
    outgo: {},
    income: {},
  };
  for (let i = start.date(); i <= end.date(); i++) {
    data.push({
      dimension: "day",
      label: i,
      outgo: 0,
      income: 0,
      categorys: {
        outgo: {},
        income: {},
      },
    });
  }
  content.outgo.forEach((o) => {
    if (
      o.time < startTime ||
      o.time > endTime ||
      ["投资", "借出"].includes(o.category)
    ) {
      return;
    }
    const date = new Date(o.time).getDate();
    const amount = getAmount(o.amount);
    const dateOutgo = data[date - 1].categorys.outgo;
    data[date - 1].outgo += amount;
    dateOutgo[o.category] = dateOutgo[o.category] || 0;
    dateOutgo[o.category] = toFixed(dateOutgo[o.category] + amount);
    cateMap.outgo[o.category] = cateMap.outgo[o.category] || 0;
    cateMap.outgo[o.category] = toFixed(cateMap.outgo[o.category] + amount);
  });
  content.income.forEach((i) => {
    if (
      i.time < startTime ||
      i.time > endTime ||
      ["投资回收", "借入", "收债", "退款"].includes(i.category)
    ) {
      return;
    }
    const date = new Date(i.time).getDate();
    const amount = getAmount(i.amount);
    data[date - 1].income += amount;
    cateMap.income[i.category] = cateMap.income[i.category] || 0;
    cateMap.income[i.category] = toFixed(cateMap.income[i.category] + amount);
  });
  return { data, cateMap };
}

function getYearData(year, content) {
  const start = moment(d(`${year}-01-01`)).startOf("year");
  const end = moment(d(`${year}-01-01`)).endOf("year");
  const data = [];
  let yearCateMap = {
    outgo: {},
    income: {},
  };

  for (let m = start.month(); m <= end.month(); m++) {
    const monthStart = moment(d(`${year}-${m + 1}-01`)).startOf("month");
    const monthEnd = moment(d(`${year}-${m + 1}-01`)).endOf("month");
    const { data: monthData, cateMap } = getMonthData(
      monthStart,
      monthEnd,
      content
    );
    let outgo = 0;
    let income = 0;
    yearCateMap = addCateData(yearCateMap, cateMap);
    monthData.forEach((m) => {
      m.outgo = toFixed(m.outgo);
      m.income = toFixed(m.income);
      outgo += m.outgo;
      income += m.income;
    });
    data.push({
      dimension: "month",
      label: m + 1,
      outgo: toFixed(outgo),
      income: toFixed(income),
      categorys: cateMap,
      children: monthData,
    });
  }
  return { data, yearCateMap };
}

function getChartData(dir) {
  const years = getFileNames(dir);
  if (!years || years.length === 0) {
    return { data: [], rawData: [] };
  }
  const rawData = [];
  const data = years
    .sort((a, b) => a - b)
    .map((year) => {
      const yearContent = getFileContent(dir, year);
      if (!yearContent.outgo && !yearContent.income) {
        return null;
      }

      rawData.push({ ...yearContent, label: year });

      const { data: yearData, yearCateMap } = getYearData(year, yearContent);
      let outgo = 0;
      let income = 0;
      yearData.forEach((y) => {
        outgo += y.outgo;
        income += y.income;
      });
      return {
        dimension: "year",
        label: year,
        outgo: toFixed(outgo),
        income: toFixed(income),
        categorys: yearCateMap,
        children: yearData,
      };
    })
    .filter((x) => x !== null);
  return { data, rawData };
}

module.exports = async function getData(dir) {
  if (!dir) {
    return { data: [], rawData: [] };
  }
  const { data, rawData } = getChartData(dir);
  return { data, rawData };
};

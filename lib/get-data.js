const moment = require("moment");
const getFileNames = require("./get-file-names");
const getFileContent = require("./get-file-content");

const getAmount = (n) => +n.replace("¥", "");
const toFixed = (n) => +n.toFixed(2);
const d = (d) => new Date(d);

function getMonthData(start, end, content) {
  const startTime = start.valueOf();
  const endTime = end.valueOf();
  const data = [];
  for (let i = start.date(); i <= end.date(); i++) {
    data.push({
      dimension: "day",
      label: i,
      outgo: 0,
      income: 0,
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
    data[date - 1].outgo += getAmount(o.amount);
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
    data[date - 1].income += getAmount(i.amount);
  });
  return data;
}

function getYearData(year, content) {
  const start = moment(d(`${year}-01-01`)).startOf("year");
  const end = moment(d(`${year}-01-01`)).endOf("year");
  const data = [];

  for (let m = start.month(); m <= end.month(); m++) {
    const monthStart = moment(d(`${year}-${m + 1}-01`)).startOf("month");
    const monthEnd = moment(d(`${year}-${m + 1}-01`)).endOf("month");
    const monthData = getMonthData(monthStart, monthEnd, content);
    let outgo = 0;
    let income = 0;
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
      categorys: {},
      children: monthData,
    });
  }
  return data;
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

      const yearData = getYearData(year, yearContent);
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
        categorys: {},
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

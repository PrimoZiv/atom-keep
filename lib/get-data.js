const fs = require("fs");
const path = require("path");
const dayjs = require("dayjs");

// TODO: 选择路径
const dataDir = path.resolve('/Users/primo/Library/Mobile Documents/com~apple~CloudDocs/个人/发票账单/有钱账单');

const getAmount = (n) => +n.replace("¥", "");
const toFixed = (n) => +n.toFixed(2);

function getFileNames() {
  const fileNames = fs.readdirSync(dataDir);
  return fileNames
    .filter((f) => f.endsWith(".json"))
    .map((f) => +f.replace(".json", ""));
}

function getFileContent(year) {
  const file = fs.readFileSync(path.join(dataDir, `${year}.json`), "utf8");
  return JSON.parse(file);
}

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
  const start = dayjs(`${year}-01-01`).startOf("year");
  const end = dayjs(`${year}-01-01`).endOf("year");
  const data = [];

  for (let m = start.month(); m <= end.month(); m++) {
    const monthStart = dayjs(`${year}-${m + 1}-01`).startOf("month");
    const monthEnd = dayjs(`${year}-${m + 1}-01`).endOf("month");
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

function getChartData() {
  const years = getFileNames();
  const data = years
    .sort((a, b) => a - b)
    .map((year) => {
      const yearContent = getFileContent(year);
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
    });
  return data;
}

module.exports = async function getData() {
  return getChartData();
};

console.log(getFileNames());

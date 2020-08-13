const fs = require("fs");
const path = require("path");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const getFileNames = require("./get-file-names");
const getFileContent = require("./get-file-content");

const getPureData = (data) => ({
  category: data.category,
  subCategory: data.subCategory,
  amount: data.amount,
  account: data.account,
  time: data.time,
  remark: data.remark,
  id: uuidv4(),
});

module.exports = function importData(dir, data) {
  const { outgo, income } = data;
  const names = getFileNames(dir);
  const dataSet = {};

  outgo.forEach((o) => {
    const t = moment(o.time);
    const year = t.year();
    if (!dataSet[year]) {
      console.log(`Get year data: ...... ${year}`);
      dataSet[year] = { outgo: [], income: [] };
    }
    dataSet[year].outgo.push(getPureData(o));
  });

  income.forEach((i) => {
    const t = moment(i.time);
    const year = t.year();
    if (!dataSet[year]) {
      dataSet[year] = { outgo: [], income: [] };
    }
    dataSet[year].income.push(getPureData(i));
  });

  Object.keys(dataSet).forEach((y) => {
    if (!names.includes(+y)) {
      console.log(`Write year data: ...... ${y}`);
      fs.writeFileSync(
        path.resolve(dir, `${y}.json`),
        JSON.stringify(dataSet[y], null, 2)
      );
    } else {
      console.log(`Merge year data: ...... ${y}`);
      const exist = getFileContent(dir, y);
      const { outgo, income } = dataSet[y];
      exist.outgo = [...exist.outgo, ...outgo];
      exist.outgo.sort((a, b) => a.time - b.time);
      exist.income = [...exist.income, ...income];
      exist.income.sort((a, b) => a.time - b.time);
      fs.renameSync(
        path.resolve(dir, `${y}.json`),
        path.resolve(dir, `${y}.back.json`)
      );
      fs.writeFileSync(
        path.resolve(dir, `${y}.json`),
        JSON.stringify(exist, null, 2)
      );
    }
  });
};

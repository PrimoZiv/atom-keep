const getFileContent = require("./get-file-content");
const dayjs = require("dayjs");

module.exports = function getRawData(dir, [year, month]) {
  const content = getFileContent(dir, year);
  const date = dayjs(`${year}-${month}-01`);
  const start = date.startOf("month").valueOf();
  const end = date.endOf("month").valueOf();

  return {
    outgo: content.outgo
      .filter((o) => o.time >= start && o.time <= end)
      .map((o, index) => ({ ...o, id: index })),
    income: content.income
      .filter((i) => i.time >= start && i.time <= end)
      .map((i, index) => ({ ...i, id: index })),
  };
};

import moment from "moment";

export default function getRawData(rawData, year, month) {
  const content = rawData.find((y) => +y.label === +year);
  const date = moment(`${year}-${month}-01`);
  const start = date.startOf("month").valueOf();
  const end = date.endOf("month").valueOf();

  return {
    outgo: content.outgo.filter((o) => o.time >= start && o.time <= end),
    income: content.income.filter((i) => i.time >= start && i.time <= end),
  };
}

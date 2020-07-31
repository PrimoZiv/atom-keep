import dayjs from "dayjs";

const guessCate = (name) => {
  const types = [
    [["永辉", "超市"], "购物"],
    [
      ["餐饮", "包点", "饭", "面点", "壹日叁食", "食品", "火锅", "混沌"],
      "餐饮",
    ],
    [["公交", "地铁", "滴滴", "嘀嘀", "打车", "摩拜", "单车"], "交通"],
    [["医院", "门诊"], "医疗"],
  ];
  for (let i = 0; i < types.length; i++) {
    const [keywords, cate] = types[i];
    if (keywords.some((k) => name.includes(k))) {
      return cate;
    }
  }
  return "";
};

export const getPureData = (data) =>
  data.map((d) => ({
    category: d.category,
    subCategory: d.subCategory,
    amount: d.amount,
    account: d.account,
    time: d.time,
    remark: d.remark,
  }));

export function icbcAdapter(raw, dataMap) {
  const outgo = [];
  const income = [];

  raw
    .trim()
    .split(/[\n\r]/)
    .forEach((t) => {
      const item = t.split(/\t/);
      const fmt = {
        category: dataMap[item[4]] || guessCate(item[4]) || "",
        subCategory: "",
        target: item[4],
        amount: `¥${parseFloat(item[5])}`,
        account: "工商银行 信用卡",
        time: dayjs(item[1]).valueOf(),
        remark: "",
      };
      if (item[6].includes("支出")) {
        fmt.id = outgo.length;
        outgo.push(fmt);
      } else {
        fmt.id = income.length;
        income.push(fmt);
      }
    });
  return {
    outgo: outgo.sort((a, b) => a.time - b.time),
    income: income.sort((a, b) => a.time - b.time),
  };
}

export function smbAdapter() {}

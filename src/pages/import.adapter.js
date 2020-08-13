import moment from "moment";

const guessCate = (name) => {
  const types = [
    [
      [
        "永辉",
        "沃尔玛",
        "大润华",
        "天虹",
        "超市",
        "商城",
        "便利店",
        "网购",
        "数码",
        "世纪卓越",
        "运动",
        "服饰",
        "图文",
        "文体",
        "箱包",
      ],
      "购物",
    ],
    [
      [
        "餐饮",
        "包点",
        "饭",
        "面点",
        "壹日叁食",
        "食品",
        "火锅",
        "混沌",
        "饿了么",
        "拉扎斯",
        "美团",
        "百果园",
      ],
      "餐饮",
    ],
    [
      [
        "公交",
        "地铁",
        "滴滴",
        "嘀嘀",
        "Uber",
        "打车",
        "摩拜",
        "单车",
        "深圳通",
        "天府通",
        "铁路",
      ],
      "交通",
    ],
    [["医院", "门诊"], "医疗"],
    [
      ["充值", "通信", "中国移动", "中国联通", "话费", "中国电信", "天翼"],
      "通讯",
    ],
    [["携程", "飞猪", "去哪", "酒店", "航空"], "旅行"],
  ];
  for (let i = 0; i < types.length; i++) {
    const [keywords, cate] = types[i];
    if (keywords.some((k) => name.includes(k))) {
      return cate;
    }
  }
  return "";
};

// 工商银行
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
        time: moment(item[1]).valueOf(),
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

// 招商银行
export function smbAdapter() {}

// 上海银行
export function boscAdapter(raw, dataMap) {
  const outgo = [];
  const income = [];

  raw
    .trim()
    .split(/[\n\r]/)
    .forEach((t) => {
      const item = t.split(",");
      const fmt = {
        category: dataMap[item[2]] || guessCate(item[2]) || "",
        subCategory: "",
        target: item[2],
        amount: `¥${parseFloat(item[1])}`,
        account: "美团信用卡",
        time: moment(item[0]).valueOf(),
        remark: "",
      };
      fmt.id = outgo.length;
      outgo.push(fmt);
    });
  return {
    outgo: outgo.sort((a, b) => a.time - b.time),
    income: income.sort((a, b) => a.time - b.time),
  };
}

export function wechatAdapter(raw, dataMap) {
  const outgo = [];
  const income = [];
  const accountMap = {
    零钱: "微信钱包 零钱通",
    招商银行: "招商银行 信用卡",
  };

  raw
    .trim()
    .split(/[\n\r]/)
    .forEach((t) => {
      const item = t.split(",");
      const fmt = {
        category: dataMap[item[2]] || guessCate(item[2]) || "",
        subCategory: "",
        target: item[2],
        amount: `¥${parseFloat(item[5].replace("¥", ""))}`,
        account: accountMap[item[6]],
        time: moment(item[0]).valueOf(),
        remark: "",
      };
      if (item[4].includes("支出")) {
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

export function alipayAdapter(raw, dataMap) {
  const outgo = [];
  const income = [];
  const t2015 = new Date("2015-01-01").getTime();

  raw
    .trim()
    .split(/[\n\r]/)
    .forEach((t) => {
      const item = t.split(",");
      const time = moment(item[2]).valueOf();
      const fmt = {
        category: dataMap[item[7]] || guessCate(item[7]) || "",
        subCategory: "",
        target: item[7],
        amount: `¥${parseFloat(item[9].replace("¥", ""))}`,
        account: time > t2015 ? "招商银行 信用卡" : "支付宝 余额宝",
        time,
        remark: "",
      };
      if (item[10].includes("支出")) {
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

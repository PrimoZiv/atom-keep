import React, { useState, useContext, useMemo } from "react";
import {
  Input,
  Radio,
  Steps,
  Table,
  Select,
  Divider,
  Button,
  message,
} from "antd";
import { StarFilled } from "@ant-design/icons";

import {
  icbcAdapter,
  smbAdapter,
  bocAdapter,
  wechatAdapter,
  alipayAdapter,
  commonAdapter,
} from "../modules/import.adapter";
import { outgoOptions, incomeOptions } from "../modules/import.config";
import StoreContext from "../modules/context";

import style from "./import.module.css";
import moment from "moment";
import ImportEmail from "./import.email";

const types = {
  icbc: {
    name: "工商银行",
    handle: icbcAdapter,
    format: {
      fields: ["", "时间", "", "", "商户", "金额", "收支", "", "", "", ""],
      separator: "[tab|,]",
    },
  },
  smb: {
    name: "招商银行",
    handle: smbAdapter,
    format: {
      fields: ["时间", "", "商户", "", "", "", "金额", "", "", "", ""],
      separator: "[,]",
    },
  },
  boc: {
    name: "中国银行",
    handle: bocAdapter,
    format: {
      fields: ["时间", "", "", "商户", "金额", "", "", "", "", "", ""],
      separator: "[space tab]",
    },
  },
  wechat: {
    name: "微信账单",
    handle: wechatAdapter,
    format: {
      fields: ["时间", "", "商户", "", "", "金额", "账户", "", "", "", ""],
      separator: "csv [,]",
    },
  },
  alipay: {
    name: "支付宝账单",
    handle: alipayAdapter,
    format: {
      fields: ["", "", "时间", "", "", "", "", "商户", "", "金额", "收支"],
      separator: "csv [,]",
    },
  },
  common: {
    name: "通用（花呗，现金，上海银行）",
    handle: commonAdapter,
    format: {
      fields: [
        "时间",
        "账户",
        "类别",
        "金额",
        "备注",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ],
      separator: "csv [,]",
    },
  },
};

const { Step } = Steps;
const { ipcRenderer } = window.electron;

export default ({ refresh }) => {
  const { store } = useContext(StoreContext);
  const { outgoMap } = store;
  const [step, setStep] = useState(0);
  const [type, setType] = useState("");
  const [raw, setRaw] = useState("");
  const [outData, setOutData] = useState([]);
  const [inData, setInData] = useState([]);
  const [emailVisible, setEmailVisible] = useState(false);

  const outgoTotal = useMemo(() => {
    if (!outData || outData.length === 0) {
      return 0;
    }
    if (outData.length === 1) {
      return outData.amount;
    }
    return outData.map((x) => x.amount).reduce((a, b) => a + b);
  }, [outData]);

  const handleImportFromEmail = (data) => {
    handleData(data.content, data.type);
  };

  const handleData = (rawDef, typeDef) => {
    let res;
    const rawValue = rawDef || raw;
    const typeValue = typeDef || type;
    if (!rawValue || !typeValue) {
      message.error("请补充账单信息");
      return;
    }
    res = types[typeValue].handle(rawValue, outgoMap);
    const { outgo, income } = res;
    setOutData(outgo);
    setInData(income);
    setStep(1);
  };

  const updateCell = (type, row, field, v) => {
    let newData;
    if (type === "outgo") {
      newData = [...outData];
    } else {
      newData = [...inData];
    }
    newData[row] = {
      ...newData[row],
      [field]: v,
    };
    if (type === "outgo") {
      setOutData(newData);
    } else {
      setInData(newData);
    }
  };

  const removeRow = (type, row) => {
    let newData;
    if (type === "outgo") {
      newData = [...outData];
    } else {
      newData = [...inData];
    }
    newData.splice(row, 1);
    if (type === "outgo") {
      setOutData(newData);
    } else {
      setInData(newData);
    }
  };

  const getColumns = (type) => {
    const options = type === "outgo" ? outgoOptions : incomeOptions;
    return [
      {
        title: "账户",
        dataIndex: "account",
        key: "account",
      },
      {
        title: "金额",
        dataIndex: "amount",
        key: "amount",
      },
      {
        title: "交易方",
        dataIndex: "target",
        key: "target",
      },
      {
        title: "时间",
        dataIndex: "time",
        key: "time",
        render: (v) => moment(v).format("YYYY-MM-DD"),
      },
      {
        title: "类别",
        dataIndex: "category",
        key: "category",
        width: 100,
        render: (v, record, index) => {
          return (
            <Select
              value={v}
              onChange={(v) => updateCell(type, index, "category", v)}
              style={{ width: "100%" }}
              options={options}
            />
          );
        },
      },
      // {
      //   title: "子类别",
      //   dataIndex: "subCategory",
      //   key: "subCategory",
      // },
      {
        title: "备注",
        dataIndex: "remark",
        key: "remark",
        render: (v, record, index) => {
          return (
            <Input
              value={v}
              onChange={(e) =>
                updateCell(type, index, "remark", e.target.value)
              }
            />
          );
        },
      },
      {
        title: "操作",
        dataIndex: "id",
        key: "operate",
        render: (v, record, index) => {
          return <Button onClick={() => removeRow(type, index)}>删除</Button>;
        },
      },
    ];
  };

  const handleSubmit = () => {
    const cateMap = {};
    outData.forEach((o) => {
      if (o.category) {
        cateMap[o.target] = o.category;
      }
    });
    ipcRenderer
      .invoke("import-data", { outgo: outData, income: inData }, cateMap)
      .then((res) => {
        message.success("提交成功");
        setStep(0);
        refresh();
      });
  };

  return (
    <div className={style.container}>
      <Button
        type="primary"
        icon={<StarFilled />}
        onClick={() => setEmailVisible(true)}
      >
        邮箱账单导入
      </Button>
      <Divider />
      <div className={style.step}>
        <Steps size="small" current={step}>
          <Step title="粘贴数据" />
          <Step title="修改数据" />
          <Step title="确认完成" />
        </Steps>
      </div>
      {step === 0 ? (
        <div className={style.input}>
          <Input.TextArea
            autoSize={{
              minRows: 10,
              maxRows: 20,
            }}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
          />
          <div style={{ marginTop: "20px" }}>
            选择类别：
            <Radio.Group value={type} onChange={(e) => setType(e.target.value)}>
              {Object.keys(types).map((t) => (
                <Radio key={t} value={t}>
                  {types[t].name}
                </Radio>
              ))}
            </Radio.Group>
          </div>
          {type ? (
            <div className={style.explain}>
              <ul>
                {types[type].format.fields.map((name, index) => (
                  <li key={index}>
                    <span>{index}</span>
                    <span>{name}</span>
                  </li>
                ))}
              </ul>
              <p>分隔符: {types[type].format.separator}</p>
            </div>
          ) : null}
          <div className={style.nextStep}>
            <Button type="primary" onClick={() => handleData()}>
              下一步
            </Button>
          </div>
        </div>
      ) : null}
      {step === 1 ? (
        <>
          <div className={style.format}>
            <Table
              size="small"
              columns={getColumns("income")}
              rowKey="id"
              pagination={false}
              dataSource={inData}
            />
            <Divider />
            <Table
              size="small"
              columns={getColumns("outgo")}
              rowKey="id"
              pagination={false}
              dataSource={outData}
            />
            <p>
              总计：
              {outgoTotal.toFixed(2)}
            </p>
          </div>
          <Button
            className={style.nextStep}
            onClick={() => setStep(2)}
            type="primary"
          >
            完成
          </Button>
        </>
      ) : null}
      {step === 2 ? (
        <>
          <div className={style.preview}>
            <pre className={style.previewItem}>
              {JSON.stringify(inData, null, 2)}
            </pre>
            <pre className={style.previewItem}>
              {JSON.stringify(outData, null, 2)}
            </pre>
          </div>
          <Button
            className={style.nextStep}
            onClick={handleSubmit}
            type="primary"
          >
            提交数据
          </Button>
        </>
      ) : null}
      <ImportEmail
        visible={emailVisible}
        hideModal={() => setEmailVisible(false)}
        importData={handleImportFromEmail}
      />
    </div>
  );
};

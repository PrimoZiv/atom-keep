import React, { useState, useContext } from "react";
import { Input, Radio, Steps, Table, Select, Divider, Button } from "antd";

import { icbcAdapter, smbAdapter, getPureData } from "./import.adapter";
import { outgoOptions, incomeOptions } from "./import.config";
import StoreContext from "../modules/context";

import style from "./import.module.css";
import dayjs from "dayjs";

const { Step } = Steps;

export default () => {
  const { store } = useContext(StoreContext);
  const { outgoMap } = store;
  const [step, setStep] = useState(0);
  const [raw, setRaw] = useState("");
  const [outData, setOutData] = useState([]);
  const [inData, setInData] = useState([]);
  const handleType = (v) => {
    let res;
    if (!raw) {
      return;
    }
    if (v === "icbc") {
      res = icbcAdapter(raw, outgoMap);
    } else if (v === "smb") {
      res = smbAdapter(raw, outgoMap);
    }
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
        render: (v) => dayjs(v).format("YYYY-MM-DD"),
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
    ];
  };

  const handleSubmit = () => {};

  return (
    <div className={style.container}>
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
            onChange={(e) => setRaw(e.target.value)}
          />
          <div style={{ marginTop: "20px" }}>
            选择类别：
            <Radio.Group onChange={(e) => handleType(e.target.value)}>
              <Radio value="icbc">工商</Radio>
              <Radio value="cmb">招商</Radio>
            </Radio.Group>
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
              {JSON.stringify(getPureData(inData), null, 2)}
            </pre>
            <pre className={style.previewItem}>
              {JSON.stringify(getPureData(outData), null, 2)}
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
    </div>
  );
};

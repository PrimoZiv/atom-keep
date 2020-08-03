import React, { useContext, useState, useEffect } from "react";
import StoreContext from "../modules/context";
import { Table, Select } from "antd";
import dayjs from "dayjs";

const { ipcRenderer } = window.electron;

const Data = () => {
  const { store } = useContext(StoreContext);
  const { data } = store;
  const [year, setYear] = useState(data[data.length - 1].label);
  const [month, setMonth] = useState("");
  const [outData, setOutData] = useState([]);
  const [inData, setInData] = useState([]);
  let yearOptions = [];

  if (year) {
    const yearObj = data.find((d) => d.label === year);
    yearOptions = yearObj ? yearObj.children : [];
  }

  useEffect(() => {
    if (year && month) {
      ipcRenderer.invoke("raw-data", [year, month]).then((res) => {
        if (res) {
          const { outgo = [], income = [] } = res;
          setOutData(outgo);
          setInData(income);
        }
      });
    }
  }, [year, month]);

  const getColumns = () => {
    return [
      {
        title: "时间",
        dataIndex: "time",
        render: (v) => dayjs(v).format("YYYY-MM-DD"),
      },
      { title: "类别", dataIndex: "category" },
      { title: "子类别", dataIndex: "subCategory" },
      { title: "账户", dataIndex: "account" },
      { title: "金额", dataIndex: "amount" },
      { title: "备注", dataIndex: "remark" },
    ];
  };

  return (
    <div>
      <Select
        style={{ width: "100px" }}
        value={year}
        onChange={(v) => setYear(v)}
      >
        {data.map((d) => (
          <Select.Option key={d.label} value={d.label}>
            {d.label}
          </Select.Option>
        ))}
      </Select>
      年
      <Select
        style={{ width: "100px" }}
        value={month}
        onChange={(v) => setMonth(v)}
      >
        {yearOptions.map((d) => (
          <Select.Option key={d.label} value={d.label}>
            {d.label}
          </Select.Option>
        ))}
      </Select>
      月
      <Table rowKey="id" columns={getColumns()} dataSource={inData} />
      <Table rowKey="id" columns={getColumns()} dataSource={outData} />
    </div>
  );
};

export default Data;

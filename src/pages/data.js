import React, { useContext, useState, useEffect } from "react";
import StoreContext from "../modules/context";
import {
  Table,
  Select,
  Divider,
  Button,
  Form,
  Radio,
  InputNumber,
  Input,
  DatePicker,
  message,
  Popconfirm,
} from "antd";
import moment from "moment";
import { outgoTypes, incomeTypes } from "../contants";
import getRawData from "./data.get";

import style from "./data.module.css";
import Modal from "antd/lib/modal/Modal";

const { ipcRenderer } = window.electron;

const Data = ({ refresh }) => {
  const { store } = useContext(StoreContext);
  const { data, rawData, accounts } = store;
  const [year, setYear] = useState(
    data && data.length > 0 ? data[data.length - 1].label : ""
  );
  const [month, setMonth] = useState("");
  const [outData, setOutData] = useState([]);
  const [inData, setInData] = useState([]);
  const [addVisible, setModal] = useState(false);
  const [options, setOptions] = useState(incomeTypes);
  const [form] = Form.useForm();
  let yearOptions = [];

  if (year && data) {
    const yearObj = data.find((d) => d.label === year);
    yearOptions = yearObj ? yearObj.children : [];
  }

  useEffect(() => {
    if (year && month) {
      const res = getRawData(rawData, year, month);
      if (res) {
        const { outgo = [], income = [] } = res;
        setOutData(outgo);
        setInData(income);
      }
    }
  }, [rawData, year, month]);

  const handleDelete = (id) => {
    console.log(id);
  };

  const getColumns = (type) => {
    const cateTypes = type === "outgo" ? outgoTypes : incomeTypes;
    return [
      {
        title: "时间",
        dataIndex: "time",
        render: (v) => moment(v).format("YYYY-MM-DD"),
      },
      {
        title: "类别",
        dataIndex: "category",
        render: (v) => {
          return (
            <Select value={v}>
              {cateTypes.map((c) => (
                <Select.Option key={c} value={c}>
                  {c}
                </Select.Option>
              ))}
            </Select>
          );
        },
      },
      { title: "子类别", dataIndex: "subCategory" },
      { title: "账户", dataIndex: "account" },
      { title: "金额", dataIndex: "amount" },
      { title: "备注", dataIndex: "remark" },
      {
        title: "操作",
        dataIndex: "id",
        render: (v) => {
          return (
            <Popconfirm title="确认删除" onConfirm={() => handleDelete(v)}>
              <Button>删除</Button>
            </Popconfirm>
          );
        },
      },
    ];
  };

  const handleType = (e) => {
    const options = e.target.value === "income" ? incomeTypes : outgoTypes;
    setOptions(options);
  };

  const onSubmit = () => {
    form.validateFields().then((values) => {
      const data = { outgo: [], income: [] };
      const d = {
        ...values,
        time: values.time.valueOf(),
        amount: `¥${values.amount}`,
      };
      delete d.type;
      if (values.type === "income") {
        data.income = [d];
      } else {
        data.outgo = [d];
      }
      ipcRenderer.invoke("import-data", data, {}).then((res) => {
        message.success("提交成功");
        form.resetFields();
        setModal(false);
        refresh();
      });
    });
  };

  return (
    <div className={style.container}>
      <div className={style.header}>
        <div>
          <Select
            style={{ width: "100px" }}
            value={year}
            onChange={(v) => setYear(v)}
          >
            {(data || []).map((d) => (
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
        </div>
        <div>
          <Button onClick={() => setModal(true)}>添加数据</Button>
        </div>
      </div>
      <Divider />
      <Table rowKey="id" columns={getColumns("income")} dataSource={inData} />
      <Table rowKey="id" columns={getColumns("outgo")} dataSource={outData} />
      <Modal
        visible={addVisible}
        onCancel={() => setModal(false)}
        forceRender={true}
        onOk={onSubmit}
      >
        <Form
          name="添加"
          form={form}
          initialValues={{
            type: "income",
            time: moment(),
            remark: "",
            amount: 0,
          }}
        >
          <Form.Item
            label="种类"
            name="type"
            onChange={handleType}
            rules={[{ required: true }]}
          >
            <Radio.Group>
              <Radio value="outgo" key="outgo">
                支出
              </Radio>
              <Radio value="income" key="income">
                收入
              </Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="类别" name="category" rules={[{ required: true }]}>
            <Select>
              {options.map((o) => (
                <Select.Option key={o} value={o}>
                  {o}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="金额" name="amount" rules={[{ required: true }]}>
            <InputNumber />
          </Form.Item>
          <Form.Item label="账户" name="account" rules={[{ required: true }]}>
            <Select>
              {accounts.map((o) => (
                <Select.Option key={o} value={o}>
                  {o}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="时间" name="time" rules={[{ required: true }]}>
            <DatePicker />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Data;

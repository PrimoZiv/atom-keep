import React, { useState } from "react";
import moment from "moment";
import { Button, Card, Form, Input, Modal, Result } from "antd";

import style from "./import.module.css";

const { ipcRenderer } = window.electron;
let msgs = [];

const ImportEmail = (props) => {
  const { visible, hideModal, importData } = props;
  const [checking, setChecking] = useState(false);
  const [email, setEmail] = useState(
    localStorage.getItem("import_email") || ""
  );
  const [password, setPassword] = useState("");
  const [data, setData] = useState(null);
  const [processMsg, setProcessMsg] = useState([]);

  const checkEmail = () => {
    if (checking || !email || !password) {
      return;
    }

    msgs = [];
    localStorage.setItem("import_email", email);
    setChecking(true);

    ipcRenderer.on("fetch-email-bill-process", (event, message) => {
      const newMsgs = [...msgs, message];
      msgs = newMsgs;
      setProcessMsg(newMsgs);
    });

    ipcRenderer
      .invoke("check-email", { email, password })
      .then(
        (data) => {
          if (data?.content) {
            setData(data);
          }
        },
        (err) => {
          console.error(err);
        }
      )
      .finally(() => {
        setChecking(false);
        ipcRenderer.removeAllListeners("fetch-email-bill-process");
      });
  };

  const handleCancel = () => {
    setData(null);
    hideModal();
  };

  const handleImport = () => {
    importData(data);
    hideModal();
  };

  const handleKeyUp = (e) => {
    if (e.keyCode === 13 || e.key === "Enter") {
      checkEmail();
    }
  };

  return (
    <Modal
      visible={visible}
      bodyStyle={{ padding: "50px" }}
      okText="导入数据"
      okButtonProps={{ disabled: !data }}
      onCancel={handleCancel}
      onOk={handleImport}
    >
      {data ? (
        <Result
          status="success"
          title={data.title}
          subTitle={moment(data.date).format("YYYY-MM-DD HH:mm:ss")}
        />
      ) : (
        <Form layout="horizontal">
          <Form.Item label="邮箱">
            <Input
              type="email"
              disabled={checking}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="密码">
            <Input
              type="password"
              disabled={checking}
              value={password}
              onKeyUp={handleKeyUp}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Item>
          <Button type="primary" loading={checking} onClick={checkEmail}>
            检查账单
          </Button>
        </Form>
      )}
      {processMsg.length > 0 ? (
        <Card size="small" title="日志" className={style.log} bordered={false}>
          <ol>
            {processMsg.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ol>
        </Card>
      ) : null}
    </Modal>
  );
};

export default ImportEmail;

import React, { useEffect, useState } from "react";
import { Layout, Spin, Menu } from "antd";
import Chart from "./components/chart";
import Import from "./components/import";
import Settings from "./components/settings";
import "./App.css";
import "antd/dist/antd.css";

const { ipcRenderer } = window.electron;
const { Content, Sider } = Layout;

function App() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState("");

  useEffect(() => {
    ipcRenderer.invoke("web-ready").then((data) => {
      console.log(data);
      setData(data);
    });
  }, []);

  const handleMenu = ({ key }) => {
    setPage(key);
  };

  const getPage = () => {
    let c = <Spin />;
    switch (page) {
      case "import":
        c = <Import />;
        break;
      case "settings":
        c = <Settings />;
        break;
      default:
        if (data) {
          c = <Chart data={data} />;
        }
    }
    return c;
  };

  return (
    <Layout className="app">
      <Sider className="sider" width={70}>
        <Menu onClick={handleMenu}>
          <Menu.Item key="">图表</Menu.Item>
          <Menu.Item key="import">导入</Menu.Item>
          <Menu.Item key="settings">设置</Menu.Item>
        </Menu>
      </Sider>
      <Content>{getPage()}</Content>
    </Layout>
  );
}

export default App;

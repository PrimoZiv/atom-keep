import React, { useEffect, useReducer } from "react";
import { Layout, Menu } from "antd";
import Chart from "./pages/chart";
import Import from "./pages/import";
import Settings from "./pages/settings";
import StoreContext from "./modules/context";
import reducer from "./modules/reducer";
import "antd/dist/antd.css";
import "./App.css";

const { ipcRenderer } = window.electron;
const { Content, Sider } = Layout;

function App() {
  const [store, dispatch] = useReducer(reducer, {
    data: null,
    dataDir: "",
    page: "chart",
    outgoMap: {},
  });
  const { data, page } = store;
  const fetchData = () => {
    ipcRenderer.invoke("fetch-data").then((data) => {
      dispatch({ type: "data", payload: data });
    });
  };

  useEffect(() => {
    ipcRenderer.invoke("init").then((res) => {
      const { data, dataDir, outgoMap } = res;
      const dispatchData = {
        data,
        dataDir,
        outgoMap,
      };
      if (!data) {
        dispatchData.page = "settings";
      }
      dispatch({ type: "init", payload: dispatchData });
    });
  }, []);

  const handleMenu = ({ key }) => {
    dispatch({ type: "page", payload: key });
  };

  const handleRefresh = () => {
    fetchData();
  };

  const getPage = () => {
    let c = null;
    switch (page) {
      case "import":
        c = <Import />;
        break;
      case "settings":
        c = <Settings refresh={handleRefresh} />;
        break;
      case "chart":
        if (data) {
          c = <Chart />;
        } else {
          c = <div className="spin">无数据</div>;
        }
        break;
      default:
    }
    return c;
  };

  return (
    <StoreContext.Provider value={{ store, dispatch }}>
      <Layout className="app">
        <Sider className="sider" width={70}>
          <Menu selectedKeys={[page]} onClick={handleMenu}>
            <Menu.Item key="chart">图表</Menu.Item>
            <Menu.Item key="data">数据</Menu.Item>
            <Menu.Item key="import">导入</Menu.Item>
            <Menu.Item key="settings">设置</Menu.Item>
          </Menu>
        </Sider>
        <Content>{getPage()}</Content>
      </Layout>
    </StoreContext.Provider>
  );
}

export default App;

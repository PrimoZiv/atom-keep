import React, { useEffect, useReducer } from "react";
import { Layout, Menu } from "antd";
import Chart from "./pages/chart";
import Stats from "./pages/stats";
import Data from "./pages/data";
import Import from "./pages/import";
import Settings from "./pages/settings";
import StoreContext from "./modules/context";
import reducer from "./modules/reducer";
import getAllAccounts from "./utils/get-all-accounts";
import "antd/dist/antd.css";
import "./App.css";

const { ipcRenderer } = window.electron;
const { Content, Sider } = Layout;

function App() {
  const [store, dispatch] = useReducer(reducer, {
    data: [],
    rawData: [],
    accounts: [],
    dataDir: "",
    page: "data",
    outgoMap: {},
  });
  const { data, page } = store;
  const fetchData = () => {
    ipcRenderer.invoke("init").then((res) => {
      const { data, rawData, dataDir, outgoMap } = res;
      const accounts = getAllAccounts(rawData);
      const dispatchData = {
        data,
        rawData,
        dataDir,
        outgoMap,
        accounts,
      };
      if (!dataDir) {
        dispatchData.page = "settings";
      }
      if (!data || data.length === 0) {
        dispatchData.page = "import";
      }
      dispatch({ type: "init", payload: dispatchData });
    });
  };

  useEffect(() => {
    fetchData();
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
        c = <Import refresh={handleRefresh} />;
        break;
      case "data":
        c = <Data refresh={handleRefresh} />;
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
      case "stats":
        if (data) {
          c = <Stats />;
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
            <Menu.Item key="chart">趋势</Menu.Item>
            <Menu.Item key="stats">统计</Menu.Item>
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

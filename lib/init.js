const path = require("path");
const { BrowserWindow, ipcMain } = require("electron");
const isDev = require("electron-is-dev");
const Store = require("electron-store");
const getData = require("./get-data");
const initStore = require("./init-store");
const importData = require("./import-data");
const getRawData = require("./get-raw-data");
const removeData = require("./remove-data");
const editData = require("./edit-data");
const getBillfromEmail = require("./get-bill-from-email");

function createWindow() {
  const store = new Store();
  const win = new BrowserWindow({
    width: 1600,
    height: 800,
    fullscreen: true,
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, "./renderer.js"),
    },
  });

  if (isDev) {
    win.loadURL("http://localhost:3000");
  } else {
    win.loadFile("./build/index.html");
  }

  // win.webContents.openDevTools();

  initStore(store);

  ipcMain.on("data-dir", (e, arg) => {
    if (arg && typeof arg === "string") {
      store.set("dataDir", arg);
    }
  });

  ipcMain.handle("fetch-data", async () => {
    const data = await getData(store.get("dataDir"));
    return data;
  });

  ipcMain.handle("init", async () => {
    const dataDir = store.get("dataDir");
    const { data, rawData } = await getData(dataDir);
    const outgoMap = store.get("outgoMap");
    return {
      dataDir,
      outgoMap,
      data,
      rawData,
    };
  });

  ipcMain.handle("check-email", async (e, data) => {
    const bill = await getBillfromEmail(data, win);
    return Promise.resolve(bill);
  });

  ipcMain.handle("import-data", async (e, data, cateMap) => {
    const dataDir = store.get("dataDir");
    const outgoMap = store.get("outgoMap");
    store.set("outgoMap", {
      ...outgoMap,
      ...cateMap,
    });
    return Promise.resolve(importData(dataDir, data));
  });

  ipcMain.handle("import-cate", async (e, cateMap) => {
    const outgoMap = store.get("outgoMap");
    store.set("outgoMap", {
      ...outgoMap,
      ...cateMap,
    });
    return Promise.resolve(true);
  });

  ipcMain.handle("raw-data", async (e, params) => {
    const dataDir = store.get("dataDir");
    return Promise.resolve(getRawData(dataDir, params));
  });

  ipcMain.handle("remove-data", (e, arg) => {
    const dataDir = store.get("dataDir");
    try {
      removeData(dataDir, arg);
    } catch (e) {
      console.log(e);
    }
    return Promise.resolve();
  });

  ipcMain.handle("edit-data", (e, arg) => {
    const dataDir = store.get("dataDir");
    try {
      editData(dataDir, arg);
    } catch (e) {
      console.log(e);
      Promise.reject();
    }
    return Promise.resolve();
  });
}

module.exports = createWindow;

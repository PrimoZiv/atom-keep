const path = require("path");
const { app, BrowserWindow, ipcMain } = require("electron");
const isDev = require("electron-is-dev");
const Store = require("electron-store");
const getData = require("../lib/get-data");
const initStore = require("../lib/init-store");
const importData = require("../lib/import-data");
const getRawData = require("../lib/get-raw-data");

const store = new Store();

function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 800,
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
    const data = await getData(dataDir);
    const outgoMap = store.get("outgoMap");
    return {
      dataDir,
      outgoMap,
      data,
    };
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

  ipcMain.handle("raw-data", async (e, params) => {
    const dataDir = store.get("dataDir");
    return Promise.resolve(getRawData(dataDir, params));
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

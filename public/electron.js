const path = require("path");
const { app, BrowserWindow, ipcMain } = require("electron");
const isDev = require("electron-is-dev");
const getData = require('../lib/get-data');

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

  ipcMain.handle("web-ready", async () => {
    const data = await getData();
    return data;
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

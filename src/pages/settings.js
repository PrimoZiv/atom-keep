import React, { useContext } from "react";

import StoreContext from "../modules/context";

import style from "./settings.module.css";

const { ipcRenderer } = window.electron;

export default ({ refresh }) => {
  const { store, dispatch } = useContext(StoreContext);
  const { dataDir } = store;

  const handleDrop = (e) => {
    ipcRenderer.send("data-dir", e.dataTransfer.files[0].path);
    refresh();
    dispatch({ type: "dataDir", payload: e.dataTransfer.files[0].path });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className={style.container}>
      <div
        className={style.action}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <p>当前路径：{dataDir}</p>
        <p className={style.hint}>拖拽目录到此区域</p>
      </div>
      <div
        className={`${style.action} ${style.hint}`}
        onDragOver={handleDragOver}
      >
        拖放「消费-类型」Map文件到这里添加预置数据
      </div>
    </div>
  );
};

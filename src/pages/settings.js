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

  const demo = `// [年份].json
  {
    "outgo": [
      {
        "category": "分类",
        "subCategory": "二级分类",
        "amount": 10, // 消费金额
        "account": "招商银行 信用卡",
        "time": 1609430400000,
        "remark": "备注",
        "id": "uuid"
      }
    ],
    "income": [
      // 同上
    ]
  }
  `;

  return (
    <div className={style.container}>
      <div
        className={style.action}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <p className={style.hint}>拖拽目录到此区域</p>
        <p>当前路径：{dataDir}</p>
        <p>数据示例：</p>
        <pre>{demo}</pre>
      </div>
      <div
        className={`${style.action} ${style.hint}`}
        onDragOver={handleDragOver}
      >
        <p className={style.hint}>拖放「消费-类型」Map文件到这里添加预置数据</p>
      </div>
    </div>
  );
};

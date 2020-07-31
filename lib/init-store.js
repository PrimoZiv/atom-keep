module.exports = function initStore(store) {
  if (!store.get("outgoMap")) {
    store.set("outgoMap", {
      "支付宝-相互宝分摊": "医疗",
      "财付通-美团点评平台商户": "餐饮",
    });
  }
};

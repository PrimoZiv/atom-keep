const historyMap = {};

module.exports = function initStore(store) {
  if (!store.get("outgoMap")) {
    store.set("outgoMap", historyMap);
  }
};

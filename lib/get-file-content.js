const fs = require("fs");
const path = require("path");

module.exports = function getFileContent(dir, year) {
  const file = fs.readFileSync(path.join(dir, `${year}.json`), "utf8");
  return JSON.parse(file);
};

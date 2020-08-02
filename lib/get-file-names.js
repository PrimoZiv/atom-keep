const fs = require("fs");

module.exports = function getFileNames(dir) {
  const fileNames = fs.readdirSync(dir);
  return fileNames
    .filter((f) => /\d{4}\.json/.test(f))
    .map((f) => +f.replace(".json", ""));
};

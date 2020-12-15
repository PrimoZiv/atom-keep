const fs = require("fs");
const path = require("path");
const getFileContent = require("./get-file-content");

module.exports = function editData(dir, { type, year, values }) {
  const content = getFileContent(dir, year);
  if (content) {
    const i = content[type].findIndex((x) => x.id === values.id);
    content[type][i] = values;
    fs.writeFileSync(
      path.resolve(dir, `${year}.json`),
      JSON.stringify(content, null, 2)
    );
  }
};

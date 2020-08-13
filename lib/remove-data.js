const fs = require("fs");
const path = require("path");
const getFileContent = require("./get-file-content");

module.exports = function removeData(dir, { year, type, id }) {
  const content = getFileContent(dir, year);
  if (content) {
    const i = content[type].findIndex((x) => x.id === id);
    content[type].splice(i, 1);
    fs.renameSync(
      path.resolve(dir, `${year}.json`),
      path.resolve(dir, `${year}.back.json`)
    );
    fs.writeFileSync(
      path.resolve(dir, `${year}.json`),
      JSON.stringify(content, null, 2)
    );
  }
};

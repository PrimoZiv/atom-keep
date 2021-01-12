const imaps = require("imap-simple");
const simpleParser = require("mailparser").simpleParser;
const cheerio = require("cheerio");

const getBillFromEmail = (data) => {
  var config = {
    imap: {
      user: data.email,
      password: data.password,
      host: "outlook.office365.com",
      port: 993,
      tls: true,
      authTimeout: 3000,
    },
  };

  return imaps.connect(config).then((connection) => {
    console.log(`${data.email} IMAP connect success`);
    return connection
      .openBox("INBOX")
      .then(() => {
        var searchCriteria = ["UNSEEN"];

        var fetchOptions = {
          bodies: ["HEADER", "TEXT"],
          markSeen: false,
        };
        console.log("Open email inbox success");

        return connection
          .search(searchCriteria, fetchOptions)
          .then(async (messages) => {
            if (!messages || messages.length === 0) {
              return null;
            }
            console.log("Email search success");
            for (let i = 0; i < messages.length; i++) {
              const data = await emailContent(messages[i]);
              if (data) {
                return data;
              }
            }
            return null;
          });
      })
      .then((data) => {
        connection.imap.closeBox(true, (err) => {
          if (err) {
            console.log(err);
          }
        });
        connection.end();
        console.log("IMAP connection closed");
        return data;
      });
  });
};

const emailContent = (item) => {
  const header = item.parts.find((p) => p.which === "HEADER");
  const text = item.parts.find((p) => p.which === "TEXT");
  const id = item.attributes.uid;
  const idHeader = "Imap-Id: " + id + "\r\n";
  const title = header.body.subject[0];
  const date = header.body.date[0];
  const from = header.body.from[0];
  let content = "";
  switch (true) {
    case /招商银行信用卡\s*<ccsvc@message\.cmbchina\.com>$/.test(from):
      return new Promise((resolve, reject) => {
        simpleParser(idHeader + text.body, (err, mail) => {
          if (err) {
            reject(err);
          }
          console.log("Email html parse success");
          // access to the whole mail object
          const $ = cheerio.load(mail.html);
          $("#fixBand15").each((index, element) => {
            const items = [];
            $(element)
              .find("font")
              .each((i, v) => {
                items.push(
                  $(v)
                    .html()
                    .replace(/(\s|&nbsp;)/g, "")
                );
              });
            content += items.join(",");
            content += "\r\n";
          });
          resolve({ title, date, content });
        });
      });
    case /中国工商银行\s*<webmaster@icbc\.com\.cn>$/.test(from):
    default:
      return Promise.resolve(null);
  }
};

module.exports = getBillFromEmail;

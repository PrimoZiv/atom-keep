const imaps = require("imap-simple");
const simpleParser = require("mailparser").simpleParser;
const cheerio = require("cheerio");

const getBillFromEmail = (data, win) => {
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

  const sync = (msg) => {
    win.webContents.send("fetch-email-bill-process", msg);
  };

  return imaps.connect(config).then(
    (connection) => {
      sync(`${data.email} IMAP连接成功。`);
      return connection
        .openBox("INBOX")
        .then(() => {
          var searchCriteria = ["UNSEEN"];

          var fetchOptions = {
            bodies: ["HEADER", "TEXT"],
            markSeen: false,
          };
          sync("打开收件箱成功。");

          return connection
            .search(searchCriteria, fetchOptions)
            .then(async (messages) => {
              if (!messages || messages.length === 0) {
                sync("没有找到未读邮件。");
                return null;
              }
              sync("邮件搜索完成。");
              for (let i = 0; i < messages.length; i++) {
                let data = null;
                try {
                  data = await emailContent(messages[i], sync);
                } catch (err) {
                  sync("邮件解析错误。");
                  data = null;
                }
                if (data) {
                  return data;
                }
              }
              sync("没有找到符合规则的账单。");
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
          sync("IMAP连接关闭");
          return data;
        });
    },
    (err) => {
      sync(`邮箱连接失败。日志:${err.toString()}`);
    }
  );
};

function emailContent(item, sync) {
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
            sync("邮件解析失败");
            reject(err);
          }
          sync("邮件解析成功。");
          // access to the whole mail object
          const $ = cheerio.load(mail.html);
          $("#fixBand15").each((index, element) => {
            const fonts = [];
            $(element)
              .find("font")
              .each((i, v) => {
                fonts.push(
                  $(v)
                    .html()
                    .replace(/(\s|&nbsp;|,)/g, "")
                );
              });
            content += fonts.join(",");
            content += "\r\n";
          });
          resolve({ title, date, content });
        });
      });
    case /中国工商银行\s*<webmaster@icbc\.com\.cn>$/.test(from):
      return new Promise((resolve, reject) => {
        simpleParser(idHeader + text.body, (err, mail) => {
          if (err) {
            sync("邮件解析失败");
            reject(err);
          }
          sync("邮件解析成功。");
          // access to the whole mail object
          const $ = cheerio.load(mail.html);
          const table = $("table")
            .filter((i, el) => {
              return $(el).find("table").length === 0;
            })
            .filter((i, el) => {
              return $(el).text().includes("主卡明细");
            });
          $(table)
            .find("tr")
            .each((i, tr) => {
              if (i > 1) {
                const tds = [];
                $(tr)
                  .find("td")
                  .each((j, td) => {
                    tds.push($(td).text().replace(/[\s,]/g, ""));
                  });
                content += tds.join(",");
                content += "\r\n";
              }
            });
          resolve({ title, date, content });
        });
      });
    case /^boczhangdan@bankofchina.com$/.test(from):
      return new Promise((resolve, reject) => {
        simpleParser(idHeader + text.body, (err, mail) => {
          if (err) {
            sync("邮件解析失败");
            reject(err);
          }
          sync("邮件解析成功。");
          // access to the whole mail object
          const $ = cheerio.load(mail.html);
          $("table.bill_pay_des")
            .eq(1)
            .find("tbody>tr")
            .each((i, tr) => {
              const tds = [];
              $(tr)
                .find("td")
                .each((j, td) => {
                  const text = $(td)
                    .text()
                    .replace(/(\s|&nbsp;|,)/g, "");
                  tds.push(text);
                });
              content += tds.join("\t");
              content += "\r\n";
            });
          resolve({ title, date, content });
        });
      });
    default:
      return Promise.resolve(null);
  }
}

module.exports = getBillFromEmail;

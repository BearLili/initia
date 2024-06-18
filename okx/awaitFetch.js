const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const headerHandle = require("./createHeader");

// 获取绝对路径
const keysFilePath = path.resolve(__dirname, "./../files/okx/okx-bsc.xlsx");

// 定义日志文件
const logFile = path.resolve(__dirname, "./../transaction_log.txt");

if (!fs.existsSync(keysFilePath)) {
  throw new Error(`File not found: ${keysFilePath}`);
}

const keysWorkbook = XLSX.readFile(keysFilePath, { cellStyles: true });
const keysSheet = keysWorkbook.Sheets[keysWorkbook.SheetNames[0]];
const keysData = XLSX.utils.sheet_to_json(keysSheet, { header: 1 });

// API URL
const baseUrl = "https://www.okx.com";
const withdrawApiUrl = "/api/v5/asset/withdrawal";

// 提现信息
function withdrawalMaker(address) {
  return {
    amt: `${Math.random() * 0.005}`,
    fee: "0.002",
    dest: "4",
    ccy: "BNB",
    chain: "BNB-BSC",
    toAddr: address,
    walletType: "private",
  };
}

// get Jennie states
async function withdraw(keysData, webid = 0) {
  if (webid >= keysData.length) {
    return;
  }

  // 记录结果到日志文件
  const logStream = fs.createWriteStream(logFile, { flags: "a" });
  const address = keysData[webid][0]; // 第一列 地址
  try {
    const body = JSON.stringify(withdrawalMaker(address));
    const headers = headerHandle.createHeaders(withdrawApiUrl, "POST", body);
    const response = await axios.post(`${baseUrl}${withdrawApiUrl}`, body, {
      headers,
    });
    if (response.data.code == "0") {
      console.info(
        `Withdrawal successful--${
          address + ":" + JSON.stringify(response.data)
        }`
      );
      logStream.write(
        `${new Date().toISOString()} - ${"successful"} - To: ${address}, body: ${
          response.data
        }\n`
      );
      logStream.end();
    } else {
      console.error(`Error withdrawing: ${JSON.stringify(response.data)}`);
      logStream.write(
        `${new Date().toISOString()} - ${"fail"} - To: ${address}, body: ${
          response.data
        }\n`
      );
      logStream.end();
    }

    setTimeout(() => withdraw(keysData, webid + 1), 5000 * Math.random());
  } catch (error) {
    console.error(`Error withdrawing: ${JSON.stringify(error)}`);
    logStream.write(
      `${new Date().toISOString()} - ${"fail"} - To: ${address}\n`
    );
    logStream.end();

    setTimeout(() => withdraw(keysData, webid + 1), 5000 * Math.random() + 8000);
  }
}

withdraw(keysData);

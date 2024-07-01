const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const headerHandle = require("./createHeader");

// 常量定义
const KEYS_FILE_PATH = path.resolve(__dirname, "./../files/okx/okx-bsc.xlsx");
const LOG_FILE_PATH = path.resolve(
  __dirname,
  `./../files/okx/transaction_log.txt`
);
const BASE_URL = "https://www.okx.com";
const WITHDRAW_API_URL = "/api/v5/asset/withdrawal";

// 检查文件是否存在
if (!fs.existsSync(KEYS_FILE_PATH)) {
  throw new Error(`File not found: ${KEYS_FILE_PATH}`);
}

// 读取 Excel 文件
const keysWorkbook = XLSX.readFile(KEYS_FILE_PATH, { cellStyles: true });
const keysSheet = keysWorkbook.Sheets[keysWorkbook.SheetNames[0]];
const keysData = XLSX.utils.sheet_to_json(keysSheet, { header: 1 });

// 提现信息生成函数
function createWithdrawalInfo(address) {
  const amt = (14.2 + Math.random() * (15.2 - 14.2)).toFixed(4); // 生成14.2到15.2之间的随机数并保留4位小数

  return {
    amt,
    fee: "0.22",
    dest: "4",
    ccy: "USDT",
    chain: "USDT-Avalanche C-Chain",
    toAddr: address,
    walletType: "private",
  };
}

// 记录日志函数
async function logTransaction(status, address, response = {}) {
  const logMessage = `${new Date().toISOString()} - ${status} - To: ${address}, body: ${JSON.stringify(
    response
  )}\n`;
  await fs.promises.appendFile(LOG_FILE_PATH, logMessage);
}

// 提现函数
async function processWithdrawal(keysData, index = 0) {
  const address = keysData[index][0]; // 第一列为地址
  let response;
  try {
    console.info(`第${index + 1}行地址开始转账...`);
    const body = JSON.stringify(createWithdrawalInfo(address));
    const headers = headerHandle.createHeaders(WITHDRAW_API_URL, "POST", body);
    response = await axios.post(`${BASE_URL}${WITHDRAW_API_URL}`, body, {
      headers,
    });

    if (response.data.code === "0") {
      console.info(
        `Withdrawal successful: ${address} - ${JSON.stringify(response.data)}`
      );
      await logTransaction("successful", address, response.data);
    } else {
      console.error(`Error withdrawing: ${JSON.stringify(response.data)}`);
      await logTransaction("fail", address, response.data);
    }
  } catch (error) {
    console.error(`Error withdrawing: ${error.message}`);
    await logTransaction("fail", address, { error: error.message });
  }

  if (index + 1 < keysData.length) {
    // 随机延迟后处理下一个提现
    const delay = 60000 + Math.random() * 60000;
    console.info(
      `第${index + 1}行转账结束，下一次将在${parseInt(
        delay / 1000
      )}秒后开始执行\n`
    );
    setTimeout(() => processWithdrawal(keysData, index + 1), delay);
  } else {
    console.info(`第${index + 1}行转账结束，全部结束！\n`);
    return;
  }
}

// 开始提现过程
processWithdrawal(keysData);

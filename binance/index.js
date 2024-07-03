const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

// 常量定义
const KEYS_FILE_PATH = path.resolve(
  __dirname,
  "./../files/binance/bn-to-exchange.xlsx"
);
const LOG_FILE_PATH = path.resolve(
  __dirname,
  `./../files/binance/transaction_log.txt`
);

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
  const amt = (0.026 + Math.random() * (0.0305 - 0.026)).toFixed(5); // 生成0.026到0.0305之间的随机数并保留3位小数
  return {
    coin: "USDT",
    walletType: 1,
    network: "BSC",
    amount: amt, // !!amount是需要减去fee的才是实际到账数量!! 
    address: address,
    timestamp: new Date().getTime(),
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
    const apiKey = keysData[index][1];
    const apiSecret = keysData[index][2];
    const client = new Spot(apiKey, apiSecret);
    console.info(`第${index + 1}行地址开始转账...`);
    //
    address && apiKey && apiSecret;
    //
    response = client.signRequest(
      "POST",
      "/sapi/v1/capital/withdraw/apply",
      createWithdrawalInfo(address)
    );

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
    const delay = 60000 + Math.random() * 70000;
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

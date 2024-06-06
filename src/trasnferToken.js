const {
  Wallet,
  LCDClient,
  MnemonicKey,
  MsgSend,
  Coins,
} = require("@initia/initia.js");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

// 获取绝对路径
const keysFilePath = path.resolve(__dirname, "./../files/targets.xlsx");

if (!fs.existsSync(keysFilePath)) {
  throw new Error(`File not found: ${keysFilePath}`);
}

// 读取目标地址和金额的 Excel 文件
const targetsWorkbook = XLSX.readFile(keysFilePath);
const targetsSheet = targetsWorkbook.Sheets[targetsWorkbook.SheetNames[0]];
const targetsData = XLSX.utils.sheet_to_json(targetsSheet);

// 创建 LCDClient 实例
const lcd = new LCDClient("https://lcd.initiation-1.initia.xyz");

// 发起钱包的助记词
const mnemonic =
  "olive trim art crater electric rare gold curious include crew citizen crawl";

// 创建发起钱包的 MnemonicKey 和 Wallet 实例
const senderKey = new MnemonicKey({ mnemonic });
const wallet = new Wallet(lcd, senderKey);

// 定义日志文件
const logFile = path.resolve(__dirname, "./../transaction_log.txt");

// 转账函数
async function transfer() {
  const results = [];
  let sendArr = targetsData.map((target) => {
    const { toAddress, amount = 1 } = target; // 假设目标表有 'toAddress' 和 'amount' 列
    const sendMsg = new MsgSend(
      wallet.accAddress, // 发起地址
      toAddress, // 目标地址
      //   {
      //     "move/944f8dd8dc49f96c25fea9849f16436dcfa6d564eec802f3ef7f8b3ea85368ff": `10000`,
      //   }
      {
        uinit: `100000`,
      }
    );
    return sendMsg;
  });

  try {
    const tx = await wallet.createAndSignTx({
      msgs: [sendArr[0]],
    });

    const result = await lcd.tx.broadcast(tx);
    if (result.txhash) {
      results.push({
        // toAddress,
        // amount,
        status: "Success",
        txhash: result.txhash,
      });
    } else {
      results.push({
        // toAddress,
        // amount,
        status: "Failed",
        error: result.raw_log,
      });
    }
  } catch (error) {
    results.push({
      //   toAddress,
      //   amount,
      status: "Failed",
      error: error.message,
    });
  }

  // 记录结果到日志文件
  const logStream = fs.createWriteStream(logFile, { flags: "a" });
  results.forEach((result) => {
    logStream.write(
      `${new Date().toISOString()} - ${
        result.status
      } - To: ${" result.toAddress"}, Amount: ${`result.amount`}, TxHash/Error: ${
        result.txhash || result.error
      }\n`
    );
  });
  logStream.end();

  console.log(
    "Transfer process completed. Check transaction_log.txt for details."
  );
}

// 执行转账
transfer();

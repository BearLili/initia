const {
  Wallet,
  LCDClient,
  MnemonicKey,
  MsgSend,
} = require("@initia/initia.js");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

// 获取绝对路径
const keysFilePath = path.resolve(__dirname, "./../files/targets.xlsx");

// 使用 fs.existsSync 检查文件是否存在
if (!fs.existsSync(keysFilePath)) {
  throw new Error(`File not found: ${keysFilePath}`);
}

// 读取目标地址和金额的 Excel 文件
const targetsWorkbook = XLSX.readFile(keysFilePath);
const targetsSheet = targetsWorkbook.Sheets[targetsWorkbook.SheetNames[0]];
const targetsData = XLSX.utils.sheet_to_json(targetsSheet);

// // 创建 LCDClient 实例
// const lcd = new LCDClient("https://lcd.testnet.initia.xyz", {
//   chainID: "testnet", // 替换为实际的 chain ID
// });

const lcd = new LCDClient("https://lcd.testnet.initia.xyz");

// 发起钱包的助记词
const mnemonic =
  "olive trim art crater electric rare gold curious include crew citizen crawl";

const recipients = targetsData.map((target) => {
  return { address: target.toAddress, amount: "100000" }; // 1.0 UNIT
});

const key = new MnemonicKey({ mnemonic });
const wallet = new Wallet(lcd, key);

// 定义日志文件
const logFile = path.resolve(__dirname, "./../transaction_log.txt");

(async () => {
  try {
    // 查询并打印发起钱包的地址和余额
    const walletAddress = wallet.accAddress;
    const balance = await lcd.bank.balanceByDenom(walletAddress, "uinit");
    console.log(`Wallet address: ${walletAddress}`);
    console.log(`Wallet balance: ${balance.amount}`);

    const results = [];

    for (const recipient of recipients) {
      const msgSend = new MsgSend(
        walletAddress,
        recipient.address,
        { uinit: "1000000" }
        //    {
        //   denom: "uinit",
        //   amount: recipient.amount,
        // }
      );

      // 定义交易费用
      const fee = {
        amount: [{ denom: "uinit", amount: "5000" }],
        gas: "200000",
      };

      try {
        const tx = await wallet.createAndSignTx({
          msgs: [msgSend],
          // fee: fee,
        });

        const result = await lcd.tx.broadcast(tx);

        if (result.txhash) {
          results.push({
            recipient: recipient.address,
            amount: recipient.amount,
            status: "Success",
            txhash: result.txhash,
          });
        } else {
          results.push({
            recipient: recipient.address,
            amount: recipient.amount,
            status: "Failed",
            error: result.raw_log,
          });
        }
      } catch (error) {
        results.push({
          recipient: recipient.address,
          amount: recipient.amount,
          status: "Failed",
          error: error.message,
        });
      }
    }

    console.log(results);

    // 记录结果到日志文件
    const logStream = fs.createWriteStream(logFile, { flags: "a" });
    results.forEach((result) => {
      logStream.write(
        `${new Date().toISOString()} - ${result.status} - To: ${
          result.recipient
        }, Amount: ${result.amount}, TxHash/Error: ${
          result.txhash || result.error
        }\n`
      );
    });
    logStream.end();
    console.log(
      "Transfer process completed. Check transaction_log.txt for details."
    );
  } catch (error) {
    console.error("An error occurred during the transfer process:", error);
  }
})();

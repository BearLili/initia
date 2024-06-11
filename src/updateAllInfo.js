const { Wallet, LCDClient, MnemonicKey } = require("@initia/initia.js");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

// 获取绝对路径
const keysFilePath = path.resolve(__dirname, "./../files/allkeys.xlsx");

if (!fs.existsSync(keysFilePath)) {
  throw new Error(`File not found: ${keysFilePath}`);
}

const keysWorkbook = XLSX.readFile(keysFilePath, { cellStyles: true });
const keysSheet = keysWorkbook.Sheets[keysWorkbook.SheetNames[0]];
const keysData = XLSX.utils.sheet_to_json(keysSheet, { header: 1 });

const BATCH_SIZE = 200; // 每批处理200条记录
const TOTAL_ROWS = keysData.length; // 总记录数

function convertAmount(amount, decimalPlaces = 6) {
  amount = amount.toString();
  while (amount.length <= decimalPlaces) {
    amount = "0" + amount;
  }
  const integerPart = amount.slice(0, -decimalPlaces);
  const decimalPart = amount.slice(-decimalPlaces);
  return `${integerPart}.${decimalPart}`;
}

const lcd = new LCDClient("https://lcd.initiation-1.initia.xyz");

async function processBatch(startRow, endRow) {
  const keysData_s = keysData.slice(startRow, endRow);
  const promises = keysData_s.map(async (row, index) => {
    const webid = startRow + index + 1;
    const keyword = row[1]; // 假设 keysSheet 中的关键字在第2列

    const key = new MnemonicKey({
      mnemonic: keyword,
    });

    const privateKey = key.privateKey.toString("hex");
    const wallet = new Wallet(lcd, key);
    try {
      const balances = await lcd.bank.balance(wallet.accAddress);
      let balancesArr = balances?.[0]?.["_coins"];
      let gas =
        balancesArr?.[
          "move/944f8dd8dc49f96c25fea9849f16436dcfa6d564eec802f3ef7f8b3ea85368ff"
        ]?.amount;
      let init = balancesArr?.["uinit"]?.amount;

      // const balances = await lcd.bank.balanceByDenom(
      //   wallet.accAddress,
      //   "move/944f8dd8dc49f96c25fea9849f16436dcfa6d564eec802f3ef7f8b3ea85368ff"
      // );

      return {
        webid,
        gas: convertAmount(gas),
        init: convertAmount(init),
        address: wallet.accAddress,
        privateKey,
      };
    } catch (err) {
      return { webid };
    }
  });
  const results = await Promise.all(promises);

  const keysDict = results.reduce(
    (acc, { webid, address, privateKey, gas, init }) => {
      acc[webid] = { address, privateKey, gas, init };
      return acc;
    },
    {}
  );

  // 更新原有的 keysData
  keysData.forEach((row, index) => {
    if (index > 0) {
      const webid = index + 1;
      if (keysDict.hasOwnProperty(webid)) {
        row[2] = keysDict[webid].gas || row[2]; // 假设 gas 在第3列
        row[3] = keysDict[webid].init || row[3]; // 假设 gas 在第3列
        row[4] = keysDict[webid].address || row[4]; // 假设 address 在第4列
        row[5] = keysDict[webid].privateKey || row[5]; // 假设 privateKey 在第5列
      }
    }
  });

  // 将修改后的数据转换回工作表
  const newInitiaSheet = XLSX.utils.aoa_to_sheet(keysData);

  // 保留原有的样式并替换原有的工作表
  keysWorkbook.Sheets[keysWorkbook.SheetNames[0]] = {
    ...newInitiaSheet,
  };

  // 保存更新后的 Excel 文件
  XLSX.writeFile(keysWorkbook, "./allkeys.xlsx");
}

async function processAllBatches() {
  for (let startRow = 0; startRow < TOTAL_ROWS; startRow += BATCH_SIZE) {
    const endRow = Math.min(startRow + BATCH_SIZE, TOTAL_ROWS);
    console.log(`Processing rows from ${startRow} to ${endRow}`);
    await processBatch(startRow, endRow);
  }
  console.log("All batches processed.");
}

// 执行批处理
processAllBatches().catch((error) => {
  console.error("An error occurred:", error);
});

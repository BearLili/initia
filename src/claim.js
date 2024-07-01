const {
  Wallet,
  LCDClient,
  MnemonicKey,
  bcs,
  TxAPI,
  MsgExecute,
} = require("@initia/initia.js");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

// 获取绝对路径
const keysFilePath = path.resolve(__dirname, "./../files/info_6.26.xlsx");

if (!fs.existsSync(keysFilePath)) {
  throw new Error(`File not found: ${keysFilePath}`);
}

const keysWorkbook = XLSX.readFile(keysFilePath, { cellStyles: true });
const keysSheet = keysWorkbook.Sheets[keysWorkbook.SheetNames[0]];
const keysData = XLSX.utils.sheet_to_json(keysSheet, { header: 1 });

const BATCH_SIZE = 200; // 每批处理200条记录
const TOTAL_ROWS = keysData.length; // 总记录数

const lcd = new LCDClient(
  "https://maze-rest-sequencer-beab9b6f-d96d-435e-9caf-5679296d8172.ue1-prod.newmetric.xyz",
  {
    chainId: "landlord-1",
    gasPrices:
      "0.151l2/afaa3f4e1717c75712f8e8073e41f051a4e516cd25daa82d948c4729388edefd",
    gasAdjustment: "2.0",
  }
);

async function processBatch(startRow, endRow, processFunction) {
  const keysData_s = keysData.slice(startRow, endRow);
  const results = await Promise.all(
    keysData_s.map((row, index) =>
      processFunction(row, startRow + index + 1, lcd)
    )
  );

  const keysDict = results.reduce((acc, result) => {
    if (result) {
      acc[result.webid] = result;
    }
    return acc;
  }, {});

  // 更新原有的 keysData
  keysData.forEach((row, index) => {
    if (index > 0) {
      const webid = index + 1;
      if (keysDict.hasOwnProperty(webid)) {
        // Update row based on keysDict result
        Object.keys(keysDict[webid]).forEach((key, colIndex) => {
          if (key != "webid") {
            row[colIndex + 2] = keysDict[webid][key] || row[colIndex + 2];
          }
        });
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
  XLSX.writeFile(keysWorkbook, keysFilePath);
}

async function processAllBatches(processFunction) {
  for (let startRow = 0; startRow < TOTAL_ROWS; startRow += BATCH_SIZE) {
    const endRow = Math.min(startRow + BATCH_SIZE, TOTAL_ROWS);
    console.log(`Processing rows from ${startRow} to ${endRow}`);
    await processBatch(startRow, endRow, processFunction);
  }
  console.log("All batches processed.");
}

// get Jennie states
async function claim(row, webid, lcd) {
  const keyword = row[1]; // 假设 keysSheet 中的关键字在第2列
  const key =
    (keyword &&
      new MnemonicKey({
        mnemonic: keyword,
      })) ||
    null;
  if (!key) {
    return {
      webid,
      isFinsh: "no",
    };
  }
  const wallet = new Wallet(lcd, key);

  try {
    const msg_1 = new MsgExecute(
      key.accAddress,
      "0x99132d33b555cd1565c59cee1e0e4ff52fbc7fb7",
      "civitia",
      "roll_dice"
    );
    const tx_1 = await wallet.createAndSignTx({
      msgs: [msg_1],
    });

    const broadcastResult_1 = await lcd.tx.broadcast(tx_1);
    console.log(broadcastResult_1);

    const msg_2 = new MsgExecute(
      key.accAddress,
      "0x99132d33b555cd1565c59cee1e0e4ff52fbc7fb7",
      "civitia",
      "claim_all_rents"
    );
    const tx_2 = await wallet.createAndSignTx({
      msgs: [msg_2],
    });

    const broadcastResult_2 = await lcd.tx.broadcast(tx_2);
    console.log(broadcastResult_2);
    return {
      webid,
      isFinsh:
        broadcastResult_1?.code === 0 && broadcastResult_2?.code === 0
          ? "ok"
          : "no",
    };
  } catch (err) {
    return { webid, isFinsh: "no" };
  }
}

// 执行批处理，传入不同的业务逻辑函数
processAllBatches(claim).catch((error) => {
  console.error("An error occurred:", error);
});

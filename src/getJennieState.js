const { Wallet, LCDClient, MnemonicKey, bcs } = require("@initia/initia.js");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

// 获取绝对路径
const keysFilePath = path.resolve(__dirname, "./../files/initia.xlsx");

if (!fs.existsSync(keysFilePath)) {
  throw new Error(`File not found: ${keysFilePath}`);
}

const keysWorkbook = XLSX.readFile(keysFilePath, { cellStyles: true });
const keysSheet = keysWorkbook.Sheets[keysWorkbook.SheetNames[0]];
const keysData = XLSX.utils.sheet_to_json(keysSheet, { header: 1 });

const BATCH_SIZE = 100; // 每批处理200条记录
const TOTAL_ROWS = keysData.length; // 总记录数

const moduleAddress = "0x9065fda28f52bb14ade545411f02e8e07a9cb4ba";
const moduleName = "jennie";
const fnName = "get_jennie_state";
const startTime = 1717552800;

const lcd = new LCDClient("https://lcd.initiation-1.initia.xyz", {
  chainId: "initiation-1",
});

async function processBatch(startRow, endRow) {
  const keysData_s = keysData.slice(startRow, endRow);
  const promises = keysData_s.map(async (row, index) => {
    const webid = startRow + index + 1;
    const keyword = row[1]; // 假设 keysSheet 中的关键字在第2列

    const key = new MnemonicKey({
      mnemonic: keyword,
    });

    try {
      const _address = bcs.address().serialize(key.accAddress).toBase64(); // arguments, BCS-encoded
      const viewResult = await lcd.move.viewFunction(
        moduleAddress,
        moduleName,
        fnName,
        undefined,
        [_address]
      );
      console.log(viewResult);
      return {
        webid,
        hp: viewResult?.hp,
        isFeed: viewResult?.update_at > startTime ? true : false,
      };
    } catch (err) {
      return { webid };
    }
  });
  const results = await Promise.all(promises);
  const keysDict = results.reduce((acc, { webid, hp, isFeed }) => {
    acc[webid] = { hp, isFeed };
    return acc;
  }, {});

  // 更新原有的 keysData
  keysData.forEach((row, index) => {
    if (index > 0) {
      const webid = index + 1;
      if (keysDict.hasOwnProperty(webid)) {
        row[6] = keysDict[webid].hp || row[6]; // 假设 hp 在第7列
        row[7] = keysDict[webid].isFeed || row[7]; // 假设 isFeed 在第8列
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

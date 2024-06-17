const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const headerHandle = require("./createHeader");

// 获取绝对路径
const keysFilePath = path.resolve(__dirname, "./../files/okx/okx-bsc.xlsx");
const outputPath = path.resolve(
  __dirname,
  "./../files/okx/okx-bsc-result.xlsx"
);

if (!fs.existsSync(keysFilePath)) {
  throw new Error(`File not found: ${keysFilePath}`);
}

const keysWorkbook = XLSX.readFile(keysFilePath, { cellStyles: true });
const keysSheet = keysWorkbook.Sheets[keysWorkbook.SheetNames[0]];
const keysData = XLSX.utils.sheet_to_json(keysSheet, { header: 1 });

const BATCH_SIZE = 10; // 每批处理200条记录
const TOTAL_ROWS = keysData.length; // 总记录数

// API URL
const baseUrl = "https://www.okx.com";
const withdrawApiUrl = "/api/v5/asset/withdrawal";

async function processBatch(startRow, endRow, processFunction) {
  const keysData_s = keysData.slice(startRow, endRow);
  const results = await Promise.all(
    keysData_s.map((row, index) => processFunction(row, startRow + index + 1))
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
          row[colIndex + 2] = keysDict[webid][key] || row[colIndex + 2];
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
  XLSX.writeFile(keysWorkbook, outputPath);
}

async function processAllBatches(processFunction) {
  for (let startRow = 1; startRow < TOTAL_ROWS; startRow += BATCH_SIZE) {
    const endRow = Math.min(startRow + BATCH_SIZE, TOTAL_ROWS);
    console.log(`Processing rows from ${startRow} to ${endRow - 1}`);
    await processBatch(startRow, endRow, processFunction);
  }
  console.log("All batches processed.");
}

// 提现信息
function withdrawalMaker(address) {
  return {
    amt: "0.0022",
    fee: "0.002",
    dest: "4",
    ccy: "BNB",
    chain: "BNB-BSC",
    toAddr: address,
    walletType: "private",
  };
}

// get Jennie states
async function withdraw(row, webid) {
  const address = row[0]; // 第一列 地址
  if (!address) {
    return { webid };
  }
  try {
    const body = JSON.stringify(withdrawalMaker(address));
    const headers = headerHandle.createHeaders(withdrawApiUrl, "POST", body);
    const response = await axios.post(`${baseUrl}${withdrawApiUrl}`, body, {
      headers,
    });
    console.info(
      `Withdrawal successful--${address + ":" + JSON.stringify(response.data)}`
    );
    return {
      webid,
      isSuccess: response?.data?.code == "0",
    };
  } catch (err) {
    console.error(
      `Error withdrawing: ${JSON.stringify(error?.response?.data)}`
    );
    return { webid, isSuccess: false };
  }
}

// 执行批处理，传入不同的业务逻辑函数
processAllBatches(withdraw).catch((error) => {
  console.error("An error occurred:", error);
});

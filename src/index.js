const {
  Wallet,
  LCDClient,
  MnemonicKey,
  bcs,
  TxAPI,
} = require("@initia/initia.js");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");

// 获取绝对路径
const keysFilePath = path.resolve(__dirname, "./../files/info_7.2.xlsx");
let output = path.resolve(
  __dirname,
  `./../files/info_${new Date().getTime()}.xlsx`
);

if (!fs.existsSync(keysFilePath)) {
  throw new Error(`File not found: ${keysFilePath}`);
}

const keysWorkbook = XLSX.readFile(keysFilePath, { cellStyles: true });
const keysSheet = keysWorkbook.Sheets[keysWorkbook.SheetNames[0]];
const keysData = XLSX.utils.sheet_to_json(keysSheet, { header: 1 });

const BATCH_SIZE = 200; // 每批处理200条记录
const TOTAL_ROWS = keysData.length; // 总记录数

const lcd = new LCDClient("https://lcd.initiation-1.initia.xyz", {
  chainId: "initiation-1",
});

function convertAmount(amount, decimalPlaces = 6) {
  amount = amount.toString();
  while (amount.length <= decimalPlaces) {
    amount = "0" + amount;
  }
  const integerPart = amount.slice(0, -decimalPlaces);
  const decimalPart = amount.slice(-decimalPlaces);
  return `${integerPart}.${decimalPart}`;
}

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
  XLSX.writeFile(keysWorkbook, path.resolve(__dirname, output));
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
async function getJennieState(row, webid, lcd) {
  const keyword = row[1]; // 假设 keysSheet 中的关键字在第2列
  const init_address = row[2]; // 假设 keysSheet 中的关键字在第2列

  const key = new MnemonicKey({
    mnemonic: keyword,
  });

  try {
    let accAddress = (keyword && key.accAddress) || init_address;
    const _address = bcs.address().serialize(accAddress).toBase64(); // arguments, BCS-encoded
    const viewResult = await lcd.move.viewFunction(
      "0x9065fda28f52bb14ade545411f02e8e07a9cb4ba",
      "jennie",
      "get_jennie_state",
      undefined,
      [_address]
    );
    console.log(viewResult);
    return {
      webid,
      hp: viewResult?.hp,
      isFeed: viewResult?.update_at > 1719367200 ? true : false,
    };
  } catch (err) {
    return { webid, hp: 0, isFeed: false };
  }
}

// get account balances
async function getAccountBalances(row, webid, lcd) {
  const keyword = row[1]; // 假设 keysSheet 中的关键字在第2列
  const init_address = row[2]; // 假设 keysSheet 中的关键字在第2列

  const key = new MnemonicKey({
    mnemonic: keyword,
  });

  const privateKey = key.privateKey.toString("hex");
  const wallet = new Wallet(lcd, key);
  try {
    let accAddress = (keyword && wallet.accAddress) || init_address;
    const balances = await lcd.bank.balance(accAddress);
    let balancesArr = balances?.[0]?.["_coins"];
    let gas =
      balancesArr?.[
        "move/944f8dd8dc49f96c25fea9849f16436dcfa6d564eec802f3ef7f8b3ea85368ff"
      ]?.amount;
    let init = balancesArr?.["uinit"]?.amount;

    return {
      webid,
      gas: convertAmount(gas),
      init: convertAmount(init),
      // address_find: wallet.accAddress,
      // privateKey,
    };
  } catch (err) {
    return { webid };
  }
}

// get Week5 Mission finished tag
async function getWeek5(row, webid, lcd) {
  const keyword = row[1]; // 假设 keysSheet 中的关键字在第2列

  const key = new MnemonicKey({
    mnemonic: keyword,
  });

  const wallet = new Wallet(lcd, key);

  try {
    // const ibcTransfer = await lcd.ibcTransfer.denomTraces();
    const ibcTransfer = await lcd.tx.search({
      query: [
        // {
        //   key: "sender",
        //   value: "init1pkch6j7wvgcfp938lv20ym46n2hfkw2r6tfawz",
        // },
        // {
        //   key: "tx.body.messages.sender",
        //   value: "init1ual53gg989jf65l9hr9acr7h8z9cfmmd349sjx",
        // },

        // {
        //   key: "tx.height",
        //   value: "1064908",
        // },

        {
          key: "tx.sender",
          value: "138799",
        },
      ],
    });
    debugger;
    //
    let flag = "";
    return {
      webid,
      week5: flag ? true : false,
    };
  } catch (err) {
    debugger;
    return { webid };
  }
}

// 执行批处理，传入不同的业务逻辑函数

processAllBatches(getJennieState).catch((error) => {
  console.error("An error occurred:", error);
});

// processAllBatches(getAccountBalances).catch((error) => {
//   console.error("An error occurred:", error);
// });

// processAllBatches(getWeek5).catch((error) => {
//   console.error("An error occurred:", error);
// });

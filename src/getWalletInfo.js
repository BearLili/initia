const { Wallet, LCDClient, MnemonicKey } = require("@initia/initia.js");
const XLSX = require("xlsx");
const keysWorkbook = XLSX.readFile("./../files/modified_initia.xlsx");
const keysSheet = keysWorkbook.Sheets[keysWorkbook.SheetNames[0]];
const keysData = XLSX.utils.sheet_to_json(keysSheet);

function convertAmount(amount, decimalPlaces = 6) {
  // 确保amount是字符串形式
  amount = amount.toString();

  // 如果小数点位置大于等于amount的长度，则在前面补零
  while (amount.length <= decimalPlaces) {
    amount = "0" + amount;
  }

  // 插入小数点
  const integerPart = amount.slice(0, -decimalPlaces);
  const decimalPart = amount.slice(-decimalPlaces);

  return `${integerPart}.${decimalPart}`;
}

const lcd = new LCDClient("https://lcd.initiation-1.initia.xyz");

(async () => {
  try {
    const promises = keysData.map(async (row) => {
      const webid = row["webid"];
      const keyword = row["keyword"]; // 假设 keysSheet 中的列名为 'keyword'

      const key = new MnemonicKey({
        mnemonic: keyword,
      });
      const wallet = new Wallet(lcd, key);

      const balances = await lcd.bank.balanceByDenom(
        wallet.accAddress,
        "move/944f8dd8dc49f96c25fea9849f16436dcfa6d564eec802f3ef7f8b3ea85368ff"
      );

      return {
        webid,
        amount: convertAmount(balances.amount),
        address: wallet.accAddress,
      };
    });

    const results = await Promise.all(promises);

    const keysDict = results.reduce((acc, { webid, amount, address }) => {
      acc[webid] = { amount, address };
      return acc;
    }, {});

    console.log(keysDict);

    // 添加 gas 列数据
    keysData.forEach((row) => {
      const webid = row["webid"];
      if (keysDict.hasOwnProperty(webid)) {
        row["gas"] = keysDict[webid].amount;
        row["address"] = keysDict[webid].address;
      }
    });

    // 将修改后的数据转换回工作表
    const newInitiaSheet = XLSX.utils.json_to_sheet(keysData);

    // 创建一个新的工作簿并附加工作表
    const newWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkbook, newInitiaSheet, "Sheet1");

    // 保存新的 Excel 文件
    XLSX.writeFile(newWorkbook, "./../wallet_gas.xlsx");
  } catch (error) {
    console.error("An error occurred:", error);
  }
})();
